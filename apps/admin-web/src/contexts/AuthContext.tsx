import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { refreshAccessToken, setRefreshSessionHandler, signIn, signOut, UNAUTHORIZED_EVENT } from "../lib/api";
import type { AuthSession, AuthUser } from "../lib/types";

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  user: AuthUser | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = "commerce_os_web_auth";
const REFRESH_TOKEN_KEY = "commerce_os_web_refresh_token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readAuthFromStorage(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, refreshToken: null, refreshTokenExpiresAt: null, user: null };

  try {
    const parsed = JSON.parse(raw) as Omit<AuthState, "refreshToken">;
    return {
      ...parsed,
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
      refreshTokenExpiresAt: parsed.refreshTokenExpiresAt ?? null
    };
  } catch {
    return { token: null, refreshToken: null, refreshTokenExpiresAt: null, user: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readAuthFromStorage());

  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setState({ token: null, refreshToken: null, refreshTokenExpiresAt: null, user: null });
  }, []);

  const applySession = useCallback((session: AuthSession) => {
    const nextState: AuthState = {
      token: session.token,
      refreshToken: session.refresh_token,
      refreshTokenExpiresAt: session.refresh_token_expires_at,
      user: session.user
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: nextState.token,
        refreshTokenExpiresAt: nextState.refreshTokenExpiresAt,
        user: nextState.user
      })
    );
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
    setState(nextState);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn(email, password);
    applySession(result);
  }, [applySession]);

  const refreshSession = useCallback(async (refreshToken: string) => {
    try {
      const session = await refreshAccessToken(refreshToken);
      applySession(session);
      return session;
    } catch {
      clearAuth();
      return null;
    }
  }, [applySession, clearAuth]);

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
    setRefreshSessionHandler(refreshSession);

    const handler = () => {
      clearAuth();
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => {
      setRefreshSessionHandler(null);
      window.removeEventListener(UNAUTHORIZED_EVENT, handler);
    };
  }, [clearAuth, refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state.token,
      refreshToken: state.refreshToken,
      refreshTokenExpiresAt: state.refreshTokenExpiresAt,
      user: state.user,
      login,
      logout
    }),
    [state.token, state.refreshToken, state.refreshTokenExpiresAt, state.user, login, logout]
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
