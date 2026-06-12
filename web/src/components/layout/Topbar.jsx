import { Bell, X } from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { cn } from '../../lib/utils';

const isDummyMode = import.meta.env.VITE_USE_DUMMY_DATA !== 'false';

export function Topbar() {
  const { sidebarOpen, demoBannerDismissed, dismissDemoBanner } = useUIStore();
  const user = useAuthStore(s => s.user);
  const isAccountant = useAuthStore(s => s.isAccountant)();

  return (
    <div className={cn(
      'fixed top-0 right-0 z-30 transition-all duration-250',
      sidebarOpen ? 'left-56' : 'left-16'
    )}>
      {/* Demo banner */}
      {isDummyMode && !demoBannerDismissed && (
        <div className="flex items-center justify-between bg-cyan-700 text-white px-4 py-2 text-sm">
          <span>Demo data — not connected to live API. All figures are illustrative.</span>
          <button onClick={dismissDemoBanner} className="p-1 rounded hover:bg-cyan-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Accountant mode banner */}
      {isAccountant && (
        <div className="flex items-center bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
          <Bell className="h-4 w-4 mr-2 flex-shrink-0" />
          Read-only — Accountant view
        </div>
      )}
    </div>
  );
}
