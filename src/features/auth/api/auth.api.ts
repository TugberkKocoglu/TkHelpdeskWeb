import { api, authHttp } from "../../../shared/api/axios";

import type {
  ApiResponse,
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "../types/auth.types";

interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export const authApi = {
  async login(input: LoginRequest): Promise<LoginResponse> {
    const response = await authHttp.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      input,
    );

    return response.data.data;
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await authHttp.post<ApiResponse<RefreshResponse>>(
      "/auth/refresh",
      {},
    );

    return response.data.data;
  },

  async logout(): Promise<void> {
    await authHttp.post("/auth/logout", {});
  },

  async me(): Promise<AuthUser> {
    const response = await api.get<ApiResponse<AuthUser>>("/auth/me");

    return response.data.data;
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.patch("/auth/change-password", input);
  },
};
