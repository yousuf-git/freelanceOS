import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import useUIStore from '../../store/uiStore';
import { cn } from '../../lib/utils';

const isDummyMode = import.meta.env.VITE_USE_DUMMY_DATA !== 'false';

export function DashboardLayout() {
  const { sidebarOpen, demoBannerDismissed } = useUIStore();
  const bannerHeight = isDummyMode && !demoBannerDismissed ? '36px' : '0px';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Topbar />
      <main className={cn(
        'transition-all duration-250 min-h-screen',
        sidebarOpen ? 'ml-56' : 'ml-16'
      )}
        style={{ paddingTop: `calc(${bannerHeight} + 0px)` }}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
