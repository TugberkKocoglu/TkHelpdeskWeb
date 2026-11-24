
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
const DEMO_USER_KEY = "tkhelpdesk_demo_user";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const DEMO_USERS: Record<string, AuthUser> = {
  "helpdesk@demo.com": {
    id: 1,
    firstName: "Demo",
    lastName: "Helpdesk",
    email: "helpdesk@demo.com",
    role: "Helpdesk",
    departmentId: 1,
  },
  "employee@demo.com": {
    id: 2,
    firstName: "Demo",
    lastName: "Personel",
    email: "employee@demo.com",
    role: "Employee",
    departmentId: 3,
  },
  "ayse@example.com": {
    id: 3,
    firstName: "Ayşe",
    lastName: "Örnek",
    email: "ayse@example.com",
    role: "Employee",
    departmentId: 2,
  },
};

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (DEMO_MODE) {
        const savedUser = sessionStorage.getItem(DEMO_USER_KEY);

        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser) as AuthUser;
            const demoUser = DEMO_USERS[parsed.email];

            if (active && demoUser) {
              setUser(demoUser);
            }
          } catch {
            sessionStorage.removeItem(DEMO_USER_KEY);
          }
        }

        if (active) {
          setLoading(false);
        }

        return;
      }

      const sessionActive = sessionStorage.getItem(
        SESSION_ACTIVE_KEY
      );

      if (sessionActive !== "true") {
        clearAccessToken();

        if (active) {
          setLoading(false);
        }

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
    if (DEMO_MODE) return;

    function handleSessionExpired() {
      sessionStorage.setItem(SESSION_ACTIVE_KEY, "false");

      queryClient.clear();
      setUser(null);
    }

    window.addEventListener(
      SESSION_EXPIRED_EVENT,
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        SESSION_EXPIRED_EVENT,
        handleSessionExpired
      );
    };
  }, [queryClient]);

  async function login(input: LoginRequest) {
    if (DEMO_MODE) {
      const email = input.email.trim().toLowerCase();
      const demoUser = DEMO_USERS[email];

      if (!demoUser || input.password !== "demo123") {
        throw new Error("Demo giriş bilgileri hatalı.");
      }

      queryClient.clear();

      sessionStorage.setItem(
        DEMO_USER_KEY,
        JSON.stringify(demoUser)
      );

      setUser(demoUser);
      return;
    }

    const result = await authApi.login(input);

    queryClient.clear();

    saveAccessToken(result.accessToken);
    sessionStorage.setItem(SESSION_ACTIVE_KEY, "true");

    setUser(result.user);
  }

  async function logout(): Promise<void> {
    if (DEMO_MODE) {
      sessionStorage.removeItem(DEMO_USER_KEY);
      clearAccessToken();
      queryClient.clear();
      setUser(null);
      return;
    }

    sessionStorage.setItem(SESSION_ACTIVE_KEY, "false");

    clearAccessToken();
    queryClient.clear();
    setUser(null);

    await waitForPendingRefresh();
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
