import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { signIn, signOut, UNAUTHORIZED_EVENT } from "../lib/api";
import type { AuthUser } from "../lib/types";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = "commerce_os_web_auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readAuthFromStorage(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };

  try {
    const parsed = JSON.parse(raw) as AuthState;
    return parsed;
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readAuthFromStorage());

  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, user: null });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn(email, password);
    const nextState: AuthState = { token: result.token, user: result.user };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setState(nextState);
  }, []);

  const logout = useCallback(async () => {
    if (state.token) {
      try {
        await signOut(state.token);
      } catch {
        // Clear local state even if API sign_out fails.
      }
    }

    clearAuth();
  }, [state.token, clearAuth]);

  useEffect(() => {
    const handler = () => {
      clearAuth();
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, [clearAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state.token,
      user: state.user,
      login,
      logout
    }),
    [state.token, state.user, login, logout]
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
