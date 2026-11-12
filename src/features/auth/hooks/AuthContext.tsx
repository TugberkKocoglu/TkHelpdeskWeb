import { useEffect, useState, type ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { authApi } from "../api/auth.api";

import type { AuthUser, LoginRequest } from "../types/auth.types";

import {
  getAccessToken,
  saveAccessToken,
  clearAccessToken,
  refreshAccessToken,
  waitForPendingRefresh,
  SESSION_EXPIRED_EVENT,
} from "../../../shared/api/axios";

import { AuthContext } from "./auth.context";

const SESSION_ACTIVE_KEY = "tkhelpdesk_session_active";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const sessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);

      // Kullanıcı daha önce çıkış yaptıysa veya bu
      // sekmede oturum açmadıysa refresh deneme.
      if (sessionActive !== "true") {
        clearAccessToken();
        setLoading(false);
        return;
      }

      try {
        if (!getAccessToken()) {
          await refreshAccessToken();
        }

        const currentUser = await authApi.me();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        clearAccessToken();
        sessionStorage.setItem(SESSION_ACTIVE_KEY, "false");

        if (active) {
          queryClient.clear();
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [queryClient]);

  useEffect(() => {
    function handleSessionExpired() {
      sessionStorage.setItem(SESSION_ACTIVE_KEY, "false");

      queryClient.clear();
      setUser(null);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [queryClient]);

  async function login(input: LoginRequest) {
    const result = await authApi.login(input);

    queryClient.clear();

    saveAccessToken(result.accessToken);

    // Başarılı giriş yapıldı.
    sessionStorage.setItem(SESSION_ACTIVE_KEY, "true");

    setUser(result.user);
  }

  async function logout(): Promise<void> {
    // Kullanıcı çıkış yaptığını belirtti.
    sessionStorage.setItem(SESSION_ACTIVE_KEY, "false");

    clearAccessToken();
    queryClient.clear();
    setUser(null);

    await waitForPendingRefresh();

    // Sunucudaki refresh token iptal edilir.
    await authApi.logout();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
