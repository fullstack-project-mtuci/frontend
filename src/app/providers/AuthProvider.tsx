import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchProfile, login as loginRequest } from "../api";
import { clearSession, loadSession, persistSession } from "../api/auth-storage";
import { getAuthTokens, onTokensChange, setAuthTokens } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  status: "checking" | "authenticated" | "unauthenticated";
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const unsubscribe = onTokensChange((tokens) => {
      if (!tokens) {
        setUser(null);
        setStatus("unauthenticated");
        clearSession();
      } else if (userRef.current) {
        persistSession({ user: userRef.current, tokens });
      }
    });

    const session = loadSession();
    if (session) {
      setAuthTokens(session.tokens);
      setUser(session.user);
      setStatus("authenticated");
      void refreshProfile();
    } else {
      setStatus("unauthenticated");
    }

    return () => {
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      setUser(profile);
      const tokens = getAuthTokens();
      if (tokens) {
        persistSession({ user: profile, tokens });
      }
      setStatus("authenticated");
    } catch (error) {
      console.error("Failed to refresh profile", error);
      setAuthTokens(null);
      clearSession();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const { user: nextUser, tokens } = await loginRequest(email, password);
      setAuthTokens(tokens);
      setUser(nextUser);
      persistSession({ user: nextUser, tokens });
      setStatus("authenticated");
    } catch (error) {
      setStatus("unauthenticated");
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthTokens(null);
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, isAuthenticating, login, logout, refreshProfile }),
    [user, status, isAuthenticating, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
