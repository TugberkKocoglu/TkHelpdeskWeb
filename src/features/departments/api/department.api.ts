import { api } from "../../../shared/api/axios";

import type { Department } from "../../users/types/user.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const departmentApi = {
  async getAll(): Promise<Department[]> {
    const response = await api.get<ApiResponse<Department[]>>("/departments");

    return response.data.data;
  },
};
