import type { AuthTokens } from "./client";
import type { User } from "../types";

const STORAGE_KEY = "btm.session";

type StoredSession = {
  user: User;
  tokens: AuthTokens;
};

export function loadSession(): StoredSession | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.tokens?.accessToken || !parsed?.tokens?.refreshToken || !parsed.user) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to parse session from storage", error);
    return null;
  }
}

export function persistSession(session: StoredSession) {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
