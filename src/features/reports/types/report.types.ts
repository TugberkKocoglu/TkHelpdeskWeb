import type {
  TicketPriority,
  TicketStatus,
} from "../../tickets/types/ticket.types";

export interface ReportFilter {
  year: number;
  month?: number;
}

export interface ReportPeriod {
  year: number;
  month: number | null;
  startDate: string;
  endDateExclusive: string;
  timeZone: string;
}

export interface ReportOverview {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  closureRate: number;
  averageResolutionMinutes: number | null;
}

export interface ReportGroup {
  id: number;
  name: string;
  total: number;
  open: number;
  closed: number;
}

export interface ReportSummary {
  period: ReportPeriod;
  overview: ReportOverview;
  statusDistribution: Record<TicketStatus, number>;
  priorityDistribution: Record<TicketPriority, number>;
  byCompany: ReportGroup[];
  byDepartment: ReportGroup[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
