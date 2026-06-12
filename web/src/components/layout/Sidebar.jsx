import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Wallet, Receipt,
  Calculator, TrendingUp, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, CreditCard
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/tax', icon: Calculator, label: 'Tax' },
  { to: '/cashflow', icon: TrendingUp, label: 'Cash Flow' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const user = useAuthStore(s => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/login');
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-250',
      sidebarOpen ? 'w-56' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">fOS</span>
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-slate-900 text-sm truncate">freelanceOS</span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 p-3">
        <div className={cn(
          'flex items-center gap-2.5 min-w-0',
          !sidebarOpen && 'justify-center'
        )}>
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700 text-xs font-semibold">
            {getInitials(user?.name || 'U')}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
