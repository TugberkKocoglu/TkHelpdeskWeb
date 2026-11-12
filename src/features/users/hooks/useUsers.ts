import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userApi } from "../api/user.api";
import { departmentApi } from "../../departments/api/department.api";

import type { UserFormValues, UpdateUserValues } from "../types/user.types";

const usersKey = ["users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: usersKey,
    queryFn: userApi.getAll,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: departmentApi.getAll,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UserFormValues) => userApi.create(input),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: usersKey,
      }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserValues }) =>
      userApi.update(id, input),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: usersKey,
      }),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      userApi.updateStatus(id, isActive),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: usersKey,
      }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      userApi.updatePassword(id, password),
  });
}
