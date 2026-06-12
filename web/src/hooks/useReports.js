import { useQuery, useMutation } from '@tanstack/react-query';
import { reports } from '../services/index';
import toast from 'react-hot-toast';

export function useAnnualSummary(fiscalYear) {
  return useQuery({
    queryKey: ['reports', 'annual', fiscalYear],
    queryFn: async () => {
      const res = await reports.getAnnualSummary({ fiscalYear });
      return res.data;
    },
  });
}

export function useClientProfitability(params = {}) {
  return useQuery({
    queryKey: ['reports', 'client-profitability', params],
    queryFn: async () => {
      const res = await reports.getClientProfitability(params);
      return res.data;
    },
  });
}

export function usePlatformComparison(params = {}) {
  return useQuery({
    queryKey: ['reports', 'platform-comparison', params],
    queryFn: async () => {
      const res = await reports.getPlatformComparison(params);
      return res.data;
    },
  });
}

export function useGenerateAnnualPdf() {
  return useMutation({
    mutationFn: (body) => reports.generateAnnualPdf(body),
    onSuccess: (res) => {
      if (res.data?.pdfUrl) window.open(res.data.pdfUrl, '_blank');
      toast.success('PDF ready — opening in new tab');
    },
    onError: (err) => toast.error(err.message || 'PDF generation failed'),
  });
}
