import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payments } from '../services/index';
import useUIStore from '../store/uiStore';
import toast from 'react-hot-toast';

export function usePayments(params = {}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const res = await payments.list(params);
      return res;
    },
  });
}

export function usePayment(id) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: async () => {
      const res = await payments.get(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  const markPaymentCreated = useUIStore(s => s.markPaymentCreated);
  const markTaxUpdated = useUIStore(s => s.markTaxUpdated);
  return useMutation({
    mutationFn: (body) => payments.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['tax'] });
      markPaymentCreated();
      markTaxUpdated();
      toast.success('Payment recorded');
    },
    onError: (err) => {
      if (err.code === 'FOREX_UNAVAILABLE' || err.status === 424) {
        // Handled at component level
        return;
      }
      toast.error(err.message || 'Failed to record payment');
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  const markTaxUpdated = useUIStore(s => s.markTaxUpdated);
  return useMutation({
    mutationFn: (id) => payments.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['tax'] });
      markTaxUpdated();
      toast.success('Payment deleted');
    },
    onError: (err) => toast.error(err.message || 'Failed to delete payment'),
  });
}
