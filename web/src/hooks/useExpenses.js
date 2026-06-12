import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenses } from '../services/index';
import useUIStore from '../store/uiStore';
import toast from 'react-hot-toast';

export function useExpenses(params = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const res = await expenses.list(params);
      return res;
    },
  });
}

export function useExpense(id) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => {
      const res = await expenses.get(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useExpenseCategorySummary(params = {}) {
  return useQuery({
    queryKey: ['expenses', 'summary', params],
    queryFn: async () => {
      const res = await expenses.getCategorySummary(params);
      return res.data;
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  const markTaxUpdated = useUIStore(s => s.markTaxUpdated);
  return useMutation({
    mutationFn: (body) => expenses.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['tax'] });
      markTaxUpdated();
      toast.success('Expense added');
    },
    onError: (err) => toast.error(err.message || 'Failed to add expense'),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => expenses.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update expense'),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  const markTaxUpdated = useUIStore(s => s.markTaxUpdated);
  return useMutation({
    mutationFn: (id) => expenses.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['tax'] });
      markTaxUpdated();
      toast.success('Expense deleted');
    },
    onError: (err) => toast.error(err.message || 'Failed to delete expense'),
  });
}
