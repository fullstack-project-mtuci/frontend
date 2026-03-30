export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

export class ApiError<T = unknown> extends Error {
  public readonly status: number;
  public readonly data: T | null;

  constructor(status: number, message: string, data: T | null = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "");

interface ApiFetchOptions {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
  signal?: AbortSignal;
}

let currentTokens: AuthTokens | null = null;
let tokensListener: ((tokens: AuthTokens | null) => void) | null = null;
let refreshPromise: Promise<AuthTokens> | null = null;

export function setAuthTokens(tokens: AuthTokens | null) {
  currentTokens = tokens;
  tokensListener?.(tokens);
}

export function onTokensChange(listener: (tokens: AuthTokens | null) => void) {
  tokensListener = listener;
  return () => {
    if (tokensListener === listener) {
      tokensListener = null;
    }
  };
}

export function getAuthTokens() {
  return currentTokens;
}

async function performFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, headers, auth = true, signal } = options;
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const finalHeaders = new Headers(headers);
  const init: RequestInit = { method, headers: finalHeaders, signal };

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = currentTokens?.accessToken;
    if (!token) {
      throw new ApiError(401, "Not authenticated");
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, init);

  if (response.status === 401 && auth && (await tryRefreshTokens())) {
    return performFetch<T>(path, { method, body, headers, auth, signal });
  }

  if (!response.ok) {
    const errorPayload = await parseJSON(response);
    const message = (errorPayload as { error?: string; message?: string })?.error ||
      (errorPayload as { message?: string })?.message ||
      response.statusText;
    throw new ApiError(response.status, message, errorPayload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await parseJSON(response)) as T;
}

async function parseJSON(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn("Failed to parse JSON", error);
    return null;
  }
}

async function tryRefreshTokens(): Promise<boolean> {
  if (!currentTokens?.refreshToken) {
    return false;
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new ApiError(res.status, "Failed to refresh token");
        }
        const data = await parseJSON(res);
        if (!data || typeof data !== "object") {
          throw new ApiError(500, "Invalid refresh response");
        }
        const tokens: AuthTokens = {
          accessToken: (data as any).accessToken,
          refreshToken: (data as any).refreshToken,
          expiresIn: (data as any).expiresIn,
        };
        currentTokens = tokens;
        tokensListener?.(tokens);
        return tokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  try {
    await refreshPromise;
    return true;
  } catch (error) {
    console.error("Token refresh failed", error);
    currentTokens = null;
    tokensListener?.(null);
    return false;
  }
}

export async function apiFetch<T>(path: string, options?: ApiFetchOptions) {
  return performFetch<T>(path, options);
}
