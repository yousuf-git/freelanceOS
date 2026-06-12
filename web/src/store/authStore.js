import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      accountId: null, // for accountant: scoped account

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setAccountId: (accountId) => {
        set({ accountId });
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null, accountId: null });
      },

      isAuthenticated: () => !!get().accessToken && !!get().user,

      isFreelancer: () => get().user?.role === 'freelancer',

      isAccountant: () => get().user?.role === 'accountant',
    }),
    {
      name: 'freelanceos-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accountId: state.accountId,
      }),
    }
  )
);

export default useAuthStore;
