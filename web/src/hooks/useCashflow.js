import { useQuery } from '@tanstack/react-query';
import { cashflow } from '../services/index';

export function useCashflowTimeline(params = {}) {
  return useQuery({
    queryKey: ['cashflow', 'timeline', params],
    queryFn: async () => {
      const res = await cashflow.getTimeline(params);
      return res.data;
    },
    staleTime: 30_000,
  });
}
