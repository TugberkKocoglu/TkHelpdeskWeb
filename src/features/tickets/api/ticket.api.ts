import { api } from "../../../shared/api/axios";

import type {
  ApiResponse,
  CreateTicketInput,
  Ticket,
  TicketComment,
  TicketDetail,
  TicketFilters,
  TicketListResult,
  TicketPriority,
} from "../types/ticket.types";

export const ticketApi = {
  async getAll(filters: TicketFilters = {}): Promise<TicketListResult> {
    const response = await api.get<ApiResponse<TicketListResult>>("/tickets", {
      params: filters,
    });

    return response.data.data;
  },

  async getById(id: number): Promise<TicketDetail> {
    const response = await api.get<ApiResponse<TicketDetail>>(`/tickets/${id}`);

    return response.data.data;
  },

  async create(input: CreateTicketInput): Promise<Ticket> {
    const response = await api.post<ApiResponse<Ticket>>("/tickets", input);

    return response.data.data;
  },

  async updatePriority(id: number, priority: TicketPriority): Promise<Ticket> {
    const response = await api.patch<ApiResponse<Ticket>>(
      `/tickets/${id}/priority`,
      { priority },
    );

    return response.data.data;
  },

  async getComments(id: number): Promise<TicketComment[]> {
    const response = await api.get<ApiResponse<TicketComment[]>>(
      `/tickets/${id}/comments`,
    );

    return response.data.data;
  },

  async addComment(id: number, content: string): Promise<TicketComment> {
    const response = await api.post<ApiResponse<TicketComment>>(
      `/tickets/${id}/comments`,
      { content },
    );

    return response.data.data;
  },

  async claim(id: number): Promise<Ticket> {
    const response = await api.post<ApiResponse<Ticket>>(
      `/tickets/${id}/claim`,
    );

    return response.data.data;
  },

  async start(id: number): Promise<Ticket> {
    const response = await api.patch<ApiResponse<Ticket>>(
      `/tickets/${id}/start`,
    );

    return response.data.data;
  },

  async close(id: number, resolutionNote: string): Promise<Ticket> {
    const response = await api.patch<ApiResponse<Ticket>>(
      `/tickets/${id}/close`,
      { resolutionNote },
    );

    return response.data.data;
  },
};
