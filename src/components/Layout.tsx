import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { clearToken } from '../lib/api';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  Database,
  Upload,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Brand } from './Brand';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/packages', label: 'Packages', icon: Package },
  { to: '/package-groups', label: 'Package Groups', icon: FolderTree },
  { to: '/repositories', label: 'Repositories', icon: Database },
  { to: '/publish', label: 'Publish', icon: Upload },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/packages': 'Package Browser',
  '/package-groups': 'Package Groups',
  '/repositories': 'Repositories',
  '/publish': 'Publish Package',
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = pageTitles[location.pathname] || 'Admin';

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#1A1A1A]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#2a2a2a] bg-[#111111] transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-[#2a2a2a] px-5">
          <Brand />
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#2a2a2a] p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#a0a0a0] transition-colors hover:bg-[#2a2a2a] hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-[#2a2a2a] bg-[#1A1A1A] px-6">
          <button
            className="text-[#a0a0a0] hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-white">{title}</h1>
        </header>
        <main className="flex-1 overflow-y-auto bg-[#1A1A1A] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
