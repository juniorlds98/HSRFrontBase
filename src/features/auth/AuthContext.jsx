import { createContext, useContext, useMemo, useState } from "react";
import { loginWithPassword, logoutFromKeycloak } from "../../services/keycloakAuthService";
import {
  clearAuthStorage,
  getRefreshToken,
  getStoredUser,
  saveAuthSession,
  getAccessToken,
} from "./authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(getAccessToken() && user);

  async function login(username, password) {
    setIsLoading(true);
    try {
      const session = await loginWithPassword(username, password);
      saveAuthSession(session);
      setUser(session.user);
      return { ok: true };
    } catch (error) {
      const reason =
        error?.response?.data?.error_description ??
        "Falha ao autenticar no Keycloak. Verifique usuario e senha.";
      return { ok: false, message: reason };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    try {
      await logoutFromKeycloak(refreshToken);
    } catch {
      // No-op, local logout is still enforced.
    }
    clearAuthStorage();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
    }),
    [user, isLoading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
