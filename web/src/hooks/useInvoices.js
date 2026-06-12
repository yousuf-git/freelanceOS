import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoices } from '../services/index';
import toast from 'react-hot-toast';

export function useInvoices(params = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const res = await invoices.list(params);
      return res;
    },
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const res = await invoices.get(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => invoices.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created');
    },
    onError: (err) => toast.error(err.message || 'Failed to create invoice'),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => invoices.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', id] });
      toast.success('Invoice updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update invoice'),
  });
}

export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => invoices.send(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice sent');
    },
    onError: (err) => toast.error(err.message || 'Failed to send invoice'),
  });
}

export function useVoidInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => invoices.voidInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice voided');
    },
    onError: (err) => toast.error(err.message || 'Cannot void invoice'),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => invoices.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted');
    },
    onError: (err) => toast.error(err.message || 'Failed to delete invoice'),
  });
}

export function useGenerateInvoicePdf() {
  return useMutation({
    mutationFn: (id) => invoices.generatePdf(id),
    onSuccess: (res) => {
      if (res.data?.pdfUrl) window.open(res.data.pdfUrl, '_blank');
      toast.success('PDF generated');
    },
    onError: (err) => toast.error(err.message || 'Failed to generate PDF'),
  });
}
