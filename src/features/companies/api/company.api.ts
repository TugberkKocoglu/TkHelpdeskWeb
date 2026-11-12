import { api } from "../../../shared/api/axios";

import type {
  Company,
  CompanyFormValues,
  CompanyApiResponse,
} from "../types/company.types";

interface SingleCompanyResponse {
  success: boolean;
  data: Company;
  message?: string;
}

export const companyApi = {
  async getAll(): Promise<Company[]> {
    const response = await api.get<CompanyApiResponse>("/companies");

    return response.data.data;
  },

  async create(input: CompanyFormValues): Promise<Company> {
    const response = await api.post<SingleCompanyResponse>("/companies", {
      name: input.name.trim(),
      contactEmail: input.contactEmail.trim() || null,
      contactPhone: input.contactPhone.trim() || null,
    });

    return response.data.data;
  },

  async update(id: number, input: CompanyFormValues): Promise<Company> {
    const response = await api.put<SingleCompanyResponse>(`/companies/${id}`, {
      name: input.name.trim(),
      contactEmail: input.contactEmail.trim() || null,
      contactPhone: input.contactPhone.trim() || null,
    });

    return response.data.data;
  },

  async updateStatus(id: number, isActive: boolean): Promise<void> {
    await api.patch(`/companies/${id}/status`, {
      isActive,
    });
  },
};
