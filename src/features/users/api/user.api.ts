import { api } from "../../../shared/api/axios";

import type {
  User,
  UserFormValues,
  UpdateUserValues,
} from "../types/user.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const userApi = {
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>("/users");
    return response.data.data;
  },

  async create(input: UserFormValues): Promise<User> {
    const response = await api.post<ApiResponse<User>>("/users", input);

    return response.data.data;
  },

  async update(id: number, input: UpdateUserValues): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, input);

    return response.data.data;
  },

  async updateStatus(id: number, isActive: boolean): Promise<void> {
    await api.patch(`/users/${id}/status`, {
      isActive,
    });
  },

  async updatePassword(id: number, password: string): Promise<void> {
    await api.patch(`/users/${id}/password`, {
      newPassword: password,
    });
  },
};
