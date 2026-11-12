export type TicketStatus = "InPool" | "Claimed" | "InProgress" | "Closed";

export type TicketPriority = "Low" | "Normal" | "High" | "Critical";

export interface Ticket {
  id: number;
  ticket_number: string;
  company_id: number;
  department_id: number;
  created_by_user_id: number;
  assigned_user_id: number | null;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  claimed_at: string | null;
  closed_at: string | null;
  resolution_note: string | null;
}

export interface TicketHistory {
  id: number;
  ticket_id: number;
  performed_by_user_id: number;
  performedByName: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  description: string | null;
  created_at: string;
}

export interface TicketDetail extends Ticket {
  assignedUserName: string | null;
  history: TicketHistory[];
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  userName: string;
  content: string;
  created_at: string;
}

export interface TicketListResult {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketFilters {
  status?: TicketStatus;
  departmentId?: number;
  companyId?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateTicketInput {
  companyId: number;
  departmentId: number;
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
