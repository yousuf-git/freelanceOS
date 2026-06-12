import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '../services/index';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export function useMe() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)();
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await auth.me();
      return res.data.user;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => auth.login(body),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore(s => s.setAuth);
  return useMutation({
    mutationFn: (body) => auth.register(body),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    },
    onError: (err) => {
      toast.error(err.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore(s => s.clearAuth);
  const refreshToken = useAuthStore(s => s.refreshToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => auth.logout({ refreshToken }),
    onSettled: () => {
      clearAuth();
      qc.clear();
    },
  });
}
