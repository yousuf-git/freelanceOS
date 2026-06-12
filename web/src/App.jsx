import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { initSocket } from './services/socket';
import useAuthStore from './store/authStore';

// Public site (editorial)
import PublicLayout from './components/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import PricingPage from './pages/public/PricingPage';
import BlogPage from './pages/public/BlogPage';
import BlogPostPage from './pages/public/BlogPostPage';
import ContactPage from './pages/public/ContactPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import SecurityPage from './pages/public/SecurityPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientsPage from './pages/clients/ClientsPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import TaxPage from './pages/tax/TaxPage';
import CashflowPage from './pages/cashflow/CashflowPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());

  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
    }
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* ── Public marketing site (editorial print) ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Route>

      {/* ── Auth (own split layout) ── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Protected dashboard ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="tax" element={<TaxPage />} />
        <Route path="cashflow" element={<CashflowPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
