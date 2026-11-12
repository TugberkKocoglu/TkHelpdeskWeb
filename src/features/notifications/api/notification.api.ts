import { api } from "../../../shared/api/axios";

import type {
  ApiResponse,
  NotificationListResult,
} from "../types/notification.types";

export const notificationApi = {
  async getAll(page = 1, pageSize = 20): Promise<NotificationListResult> {
    const response = await api.get<ApiResponse<NotificationListResult>>(
      "/notifications",
      {
        params: { page, pageSize },
      },
    );

    return response.data.data;
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<number> {
    const response = await api.patch<ApiResponse<{ updatedCount: number }>>(
      "/notifications/read-all",
    );

    return response.data.data.updatedCount;
  },
};
