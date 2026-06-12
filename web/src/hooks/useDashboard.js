import { useQuery } from '@tanstack/react-query';
import { dashboard } from '../services/index';
import useUIStore from '../store/uiStore';

export function useDashboardSummary(period, date) {
  const taxUpdatedAt = useUIStore(s => s.taxUpdatedAt);
  return useQuery({
    queryKey: ['dashboard', 'summary', period, date, taxUpdatedAt],
    queryFn: async () => {
      const res = await dashboard.getSummary({ period, date });
      return res.data;
    },
    staleTime: 20_000,
  });
}

export function useDashboardTrends(months = 12) {
  const taxUpdatedAt = useUIStore(s => s.taxUpdatedAt);
  return useQuery({
    queryKey: ['dashboard', 'trends', months, taxUpdatedAt],
    queryFn: async () => {
      const res = await dashboard.getTrends({ granularity: 'month', months });
      return res.data;
    },
    staleTime: 30_000,
  });
}
