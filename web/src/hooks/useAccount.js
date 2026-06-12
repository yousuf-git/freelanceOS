import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { account, accountants } from '../services/index';
import toast from 'react-hot-toast';

export function useAccountSettings() {
  return useQuery({
    queryKey: ['account', 'settings'],
    queryFn: async () => {
      const res = await account.getSettings();
      return res.data;
    },
  });
}

export function useUpdateAccountSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => account.updateSettings(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['account'] });
      toast.success('Settings saved');
    },
    onError: (err) => toast.error(err.message || 'Failed to save settings'),
  });
}

export function useAccountants() {
  return useQuery({
    queryKey: ['accountants'],
    queryFn: async () => {
      const res = await accountants.list();
      return res;
    },
  });
}

export function useInviteAccountant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => accountants.invite(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accountants'] });
      toast.success('Invitation sent');
    },
    onError: (err) => toast.error(err.message || 'Failed to send invitation'),
  });
}

export function useRevokeAccountant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => accountants.revoke(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accountants'] });
      toast.success('Access revoked');
    },
    onError: (err) => toast.error(err.message || 'Failed to revoke access'),
  });
}
