import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { getReminders, sendManualReminder, getReminderHistory } from '@/api/reminders';

/**
 * Hook to fetch all reminders for the company
 */
export const useReminders = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const token = await getToken();
      const response = await getReminders(token);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to send a manual reminder
 */
export const useSendManualReminder = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, channel }) => {
      const token = await getToken();
      return sendManualReminder(documentId, channel, token);
    },
    onSuccess: () => {
      // Optionally refetch reminders after sending
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
};

/**
 * Hook to fetch reminder history for a document
 */
export const useReminderHistory = (documentId) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['reminderHistory', documentId],
    queryFn: async () => {
      const token = await getToken();
      const response = await getReminderHistory(documentId, token);
      return response.data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
