import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Hook to fetch tickets for current user's company
 */
export const useTickets = (page = 1, limit = 20, filters = {}) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['tickets', page, limit, filters],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });

      const response = await fetch(`${API_URL}/api/tickets?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const result = await response.json();
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
};

/**
 * Hook to fetch single ticket by ID
 */
export const useTicket = (ticketId) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!ticketId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create a new ticket
 */
export const useCreateTicket = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate tickets query to refetch
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

/**
 * Hook to add comment to ticket
 */
export const useAddComment = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, comment, attachments, isInternal }) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment, attachments, isInternal }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific ticket query
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['adminTicket', variables.ticketId] });
    },
  });
};

/**
 * Hook to reopen ticket
 */
export const useReopenTicket = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, reason }) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/${ticketId}/reopen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reopen ticket');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// ============= SUPER ADMIN HOOKS =============

/**
 * Hook to fetch all tickets (Super Admin)
 */
export const useAllTickets = (page = 1, limit = 50, filters = {}) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['allTickets', page, limit, filters],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });

      const response = await fetch(`${API_URL}/api/tickets/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all tickets');
      }

      const result = await response.json();
      return result.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch single ticket by ID (Super Admin)
 */
export const useAdminTicket = (ticketId) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['adminTicket', ticketId],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/admin/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!ticketId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch ticket statistics (Super Admin)
 */
export const useTicketStats = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['ticketStats'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket stats');
      }

      const result = await response.json();
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to update ticket status (Super Admin)
 */
export const useUpdateTicketStatus = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, status, notes }) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ticket status');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['adminTicket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['allTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
    },
  });
};

/**
 * Hook to update ticket priority (Super Admin)
 */
export const useUpdateTicketPriority = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, priority }) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/${ticketId}/priority`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ticket priority');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['adminTicket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['allTickets'] });
    },
  });
};

/**
 * Hook to assign ticket (Super Admin)
 */
export const useAssignTicket = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, assignedToId }) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedToId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign ticket');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['adminTicket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['allTickets'] });
    },
  });
};

/**
 * Hook to delete ticket (Super Admin)
 */
export const useDeleteTicket = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
    },
  });
};
