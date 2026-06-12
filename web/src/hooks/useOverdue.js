import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { overdue, reminders } from '../services/index';
import toast from 'react-hot-toast';

export function useOverdue(params = {}) {
  return useQuery({
    queryKey: ['overdue', params],
    queryFn: async () => {
      const res = await overdue.getOverdue(params);
      return res.data;
    },
  });
}

export function useReminders(invoiceId) {
  return useQuery({
    queryKey: ['reminders', invoiceId],
    queryFn: async () => {
      const res = await reminders.list(invoiceId);
      return res;
    },
    enabled: !!invoiceId,
  });
}

export function useCreateReminder(invoiceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => reminders.create(invoiceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders', invoiceId] });
      toast.success('Reminder created');
    },
    onError: (err) => toast.error(err.message || 'Failed to create reminder'),
  });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => reminders.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Reminder updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update reminder'),
  });
}
