import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tax } from '../services/index';
import useUIStore from '../store/uiStore';
import toast from 'react-hot-toast';

export function useTaxConfig() {
  return useQuery({
    queryKey: ['tax', 'config'],
    queryFn: async () => {
      const res = await tax.getConfig();
      return res.data;
    },
  });
}

export function useTaxPresets() {
  return useQuery({
    queryKey: ['tax', 'presets'],
    queryFn: async () => {
      const res = await tax.getPresets();
      return res.data;
    },
    staleTime: Infinity,
  });
}

export function useTaxLiability(fiscalYear) {
  const taxUpdatedAt = useUIStore(s => s.taxUpdatedAt);
  return useQuery({
    queryKey: ['tax', 'liability', fiscalYear, taxUpdatedAt],
    queryFn: async () => {
      const res = await tax.getLiability({ fiscalYear });
      return res.data;
    },
    staleTime: 15_000,
  });
}

export function useUpdateTaxConfig() {
  const qc = useQueryClient();
  const markTaxUpdated = useUIStore(s => s.markTaxUpdated);
  return useMutation({
    mutationFn: (body) => tax.putConfig(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tax'] });
      markTaxUpdated();
      toast.success('Tax configuration updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update tax config'),
  });
}
