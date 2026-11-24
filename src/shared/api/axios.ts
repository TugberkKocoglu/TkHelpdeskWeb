import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { demoAdapter } from "./demoAdapter";

export const ACCESS_TOKEN_KEY = "tkhelpdesk_access_token";

export const TOKEN_UPDATED_EVENT = "tkhelpdesk:token-updated";

export const SESSION_EXPIRED_EVENT = "tkhelpdesk:session-expired";



const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5218/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const commonConfig = {
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "X-Client-Platform": "web",
  },
};

// Login, refresh ve logout isteklerinde kullanılır.
// Response interceptor eklenmez; refresh döngüsü oluşmaz.
export const authHttp = axios.create(commonConfig);

export const api = axios.create(commonConfig);

let refreshPromise: Promise<string> | null = null;
let sessionVersion = 0;

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);

  window.dispatchEvent(new Event(TOKEN_UPDATED_EVENT));
}

export function clearAccessToken(): void {
  sessionVersion++;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

function expireSession(): void {
  clearAccessToken();

  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export async function waitForPendingRefresh(): Promise<void> {
  const pending = refreshPromise;

  if (!pending) return;

  try {
    await pending;
  } catch {
    // Logout işlemine devam edebilmek için bekleyen
    // refresh isteğinin sonucunu burada yutmamız yeterli.
  }
}

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const startedAtVersion = sessionVersion;

  const promise = authHttp
    .post<ApiResponse<RefreshResponse>>("/auth/refresh", {})
    .then((response) => {
      const token = response.data.data.accessToken;

      if (startedAtVersion !== sessionVersion) {
        throw new Error("Oturum değişti.");
      }

      saveAccessToken(token);

      return token;
    })
    .catch((error: unknown) => {
      if (startedAtVersion === sessionVersion) {
        expireSession();
      }

      throw error;
    })
    .finally(() => {
      if (refreshPromise === promise) {
        refreshPromise = null;
      }
    });

  refreshPromise = promise;

  return promise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? "";

    // Login, refresh ve logout için otomatik
    // refresh denemesi yapılmaz.
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();

      originalRequest.headers.set("Authorization", `Bearer ${newToken}`);

      return api(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);

// Yalnızca demo modunda örnek API yanıtlarını kullan.
if (import.meta.env.VITE_DEMO_MODE === "true") {
  api.defaults.adapter = demoAdapter;
  authHttp.defaults.adapter = demoAdapter;
}
