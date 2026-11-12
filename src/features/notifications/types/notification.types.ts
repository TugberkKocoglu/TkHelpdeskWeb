export interface Notification {
  id: number;
  user_id: number;
  ticket_id?: number | null;
  type?: string;
  title?: string | null;
  message?: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResult {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
