import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clients } from '../services/index';
import toast from 'react-hot-toast';

export function useClients(params = {}) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      const res = await clients.list(params);
      return res;
    },
  });
}

export function useClient(id) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const res = await clients.get(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => clients.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created');
    },
    onError: (err) => toast.error(err.message || 'Failed to create client'),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => clients.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      qc.invalidateQueries({ queryKey: ['clients', id] });
      toast.success('Client updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update client'),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => clients.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted');
    },
    onError: (err) => toast.error(err.message || 'Failed to delete client'),
  });
}

export function useClientNotes(clientId, params = {}) {
  return useQuery({
    queryKey: ['clients', clientId, 'notes', params],
    queryFn: async () => {
      const res = await clients.getNotes(clientId, params);
      return res;
    },
    enabled: !!clientId,
  });
}

export function useAddClientNote(clientId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => clients.addNote(clientId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients', clientId, 'notes'] });
      toast.success('Note added');
    },
    onError: (err) => toast.error(err.message || 'Failed to add note'),
  });
}

export function useDeleteClientNote(clientId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId) => clients.deleteNote(clientId, noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients', clientId, 'notes'] });
    },
  });
}
