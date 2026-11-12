import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { companyApi } from "../api/company.api";
import type { CompanyFormValues } from "../types/company.types";

export const companyKeys = {
  all: ["companies"] as const,
};

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.all,
    queryFn: companyApi.getAll,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompanyFormValues) => companyApi.create(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: companyKeys.all,
      });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CompanyFormValues }) =>
      companyApi.update(id, input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: companyKeys.all,
      });
    },
  });
}

export function useUpdateCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      companyApi.updateStatus(id, isActive),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: companyKeys.all,
      });
    },
  });
}
