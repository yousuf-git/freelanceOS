import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Demo banner
  demoBannerDismissed: false,
  dismissDemoBanner: () => set({ demoBannerDismissed: true }),

  // Live tax/payment updates (for pulse animation)
  taxUpdatedAt: null,
  paymentCreatedAt: null,
  markTaxUpdated: () => set({ taxUpdatedAt: Date.now() }),
  markPaymentCreated: () => set({ paymentCreatedAt: Date.now() }),

  // Cash flow danger windows from socket
  dangerWindows: [],
  setDangerWindows: (windows) => set({ dangerWindows: windows }),

  // Active period for dashboard
  dashboardPeriod: 'month',
  setDashboardPeriod: (period) => set({ dashboardPeriod: period }),

  // Active fiscal year for reports/tax
  activeFiscalYear: new Date().getFullYear(),
  setActiveFiscalYear: (year) => set({ activeFiscalYear: year }),

  // Modal states
  modals: {},
  openModal: (name, data = null) =>
    set((s) => ({ modals: { ...s.modals, [name]: { open: true, data } } })),
  closeModal: (name) =>
    set((s) => ({ modals: { ...s.modals, [name]: { open: false, data: null } } })),
  getModal: (name) => get().modals[name] || { open: false, data: null },
}));

export default useUIStore;
