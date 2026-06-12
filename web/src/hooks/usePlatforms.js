import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platforms } from '../services/index';
import toast from 'react-hot-toast';

export function usePlatforms(params = {}) {
  return useQuery({
    queryKey: ['platforms', params],
    queryFn: async () => {
      const res = await platforms.list(params);
      return res;
    },
    staleTime: 60_000,
  });
}

export function usePlatform(id) {
  return useQuery({
    queryKey: ['platforms', id],
    queryFn: async () => {
      const res = await platforms.get(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => platforms.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platforms'] });
      toast.success('Platform created');
    },
    onError: (err) => toast.error(err.message || 'Failed to create platform'),
  });
}

export function useUpdatePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => platforms.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platforms'] });
      toast.success('Platform updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update platform'),
  });
}

export function useDeletePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => platforms.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platforms'] });
      toast.success('Platform deleted');
    },
    onError: (err) => toast.error(err.message || 'Failed to delete platform'),
  });
}
