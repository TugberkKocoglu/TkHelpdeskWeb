import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../auth/hooks/useAuth";
import { notificationApi } from "../api/notification.api";

export const notificationKeys = {
  all: ["notifications"] as const,
  user: (userId: number) => ["notifications", userId] as const,
  list: (userId: number, page: number, pageSize: number) =>
    ["notifications", userId, page, pageSize] as const,
};

export function useNotifications(page = 1, pageSize = 20) {
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  return useQuery({
    queryKey: notificationKeys.list(userId, page, pageSize),
    queryFn: () => notificationApi.getAll(page, pageSize),
    enabled: userId > 0,
    staleTime: 0,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}
