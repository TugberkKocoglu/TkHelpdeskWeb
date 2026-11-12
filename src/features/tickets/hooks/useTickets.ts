import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ticketApi } from "../api/ticket.api";

import type {
  CreateTicketInput,
  TicketFilters,
  TicketPriority,
} from "../types/ticket.types";

export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => ["tickets", "list"] as const,
  list: (filters: TicketFilters) => ["tickets", "list", filters] as const,
  detail: (id: number) => ["tickets", "detail", id] as const,
  comments: (id: number) => ["tickets", "comments", id] as const,
};

export function useTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ticketKeys.list(filters),
    queryFn: () => ticketApi.getAll(filters),
  });
}

export function useTicketDetail(id: number) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketApi.getById(id),
    enabled: id > 0,
  });
}

export function useTicketComments(id: number) {
  return useQuery({
    queryKey: ticketKeys.comments(id),
    queryFn: () => ticketApi.getComments(id),
    enabled: id > 0,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTicketInput) => ticketApi.create(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.all,
      });
    },
  });
}

export function useUpdateTicketPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: TicketPriority }) =>
      ticketApi.updatePriority(id, priority),

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(variables.id),
      });
    },
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      ticketApi.addComment(id, content),

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.comments(variables.id),
      });
    },
  });
}

export function useClaimTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketApi.claim(id),

    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(id),
      });
    },
  });
}

export function useEmployeeTickets() {
  return useQuery({
    queryKey: ["tickets", "employee-all"],
    queryFn: async () => {
      const pageSize = 100;
      const firstPage = await ticketApi.getAll({
        page: 1,
        pageSize,
      });

      const items = [...firstPage.items];

      for (let page = 2; page <= firstPage.totalPages; page++) {
        const result = await ticketApi.getAll({
          page,
          pageSize,
        });

        items.push(...result.items);
      }

      return items;
    },
  });
}

export function useStartTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketApi.start(id),

    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(id),
      });
    },
  });
}

export function useCloseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      resolutionNote,
    }: {
      id: number;
      resolutionNote: string;
    }) => ticketApi.close(id, resolutionNote),

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(variables.id),
      });
    },
  });
}
