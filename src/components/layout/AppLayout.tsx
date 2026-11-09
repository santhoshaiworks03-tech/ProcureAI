import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Package,
  Truck,
  TrendingUp,
  FileText,
  CheckSquare,
  CreditCard,
  History,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  ShieldCheck,
  UserCheck,
  SlidersHorizontal,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { store } from '../../lib/store';
import { UserRole } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>(store.getCurrentUser().role);
  const [notificationsCount, setNotificationsCount] = useState(
    store.getNotifications().filter(n => !n.is_read).length
  );
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setActiveRole(store.getCurrentUser().role);
      setNotificationsCount(store.getNotifications().filter(n => !n.is_read).length);
    });
    return unsubscribe;
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    store.setRole(newRole);
    setActiveRole(newRole);
  };

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'AI Procurement', path: '/agent', icon: Bot },
    { label: 'Product Catalogue', path: '/catalogue', icon: Package },
    { label: 'Suppliers', path: '/suppliers', icon: Truck },
    { label: 'Supplier Intelligence', path: '/intelligence', icon: SlidersHorizontal },
    { label: 'Demand Forecasting', path: '/forecasting', icon: TrendingUp },
    { label: 'Purchase Orders', path: '/orders', icon: FileText },
    {
      label: 'Approvals',
      path: '/approvals',
      icon: CheckSquare,
      badge: store.getApprovalRequests().filter(a => a.status === 'pending').length
    },
    { label: 'Payments & Checkout', path: '/payments', icon: CreditCard },
    { label: 'Provenance Ledger', path: '/provenance', icon: History },
    { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: notificationsCount },
    { label: 'Administration', path: '/admin', icon: Settings }
  ];

  const currentUser = store.getCurrentUser();
  const org = store.getActiveOrganisation();

  return (
    <div className="flex min-h-screen bg-[#F6F8FA] font-sans antialiased text-slate-800">
      {/* Sidebar: Deep Ink Neutral (#0D111A) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0D111A] text-slate-300 flex flex-col transition-[width] duration-200 border-r border-[#1B2230] ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#1B2230]">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 tracking-wider">
              P
            </div>
            {!collapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-white tracking-tight">ProcureAI</span>
                <span className="text-[10px] text-slate-400 font-mono">v1.0</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Current Organization */}
        {!collapsed && (
          <div className="px-3 py-2.5 mx-2 my-2 rounded-lg bg-[#141A26] border border-[#1E2638]">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {activeRole === 'supplier'
                    ? 'OmniOffice Direct Ltd'
                    : activeRole === 'admin'
                    ? 'ProcureAI Global'
                    : org.name}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {activeRole === 'supplier'
                    ? 'Verified Supplier Partner'
                    : activeRole === 'admin'
                    ? 'Root Administrator'
                    : 'Verified Enterprise'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0 opacity-80" strokeWidth={1.5} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1B2230] space-y-2">
          {!collapsed && (
            <div className="px-2 py-1.5 rounded-md bg-[#141A26] border border-[#1E2638] text-[11px] flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>PayPal Sandbox</span>
              </span>
              <span className="font-mono text-[10px]">v2</span>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-full border border-slate-700 object-cover flex-shrink-0"
              />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-200 truncate">{currentUser.full_name}</p>
                  <p className="text-[10px] text-slate-400 capitalize truncate">{currentUser.role} Portal</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={() => {
                  store.logout();
                  navigate('/login');
                }}
                className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors"
                title="Sign out of portal"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 flex items-center justify-between">
          {/* Search */}
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/catalogue?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Authenticated Portal Badge & Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" /> Portal:
              </span>
              {(['buyer', 'supplier', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors capitalize ${
                    activeRole === r
                      ? 'bg-white text-slate-900 shadow-subtle'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
              <Link
                to={`/login?role=${activeRole}`}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-medium px-2 border-l border-slate-200 hover:underline"
                title="Open dedicated sign-in portal"
              >
                Sign In
              </Link>
            </div>

            {/* Quick Sign Out */}
            <button
              onClick={() => {
                store.logout();
                navigate('/login');
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
              title="Sign out of portal"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full"></span>
              )}
            </Link>

            {/* PayPal Sandbox External Link */}
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Open PayPal Sandbox Developer Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sandbox</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
