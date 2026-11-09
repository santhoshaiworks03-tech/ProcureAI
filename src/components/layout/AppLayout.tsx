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
  Sparkles,
  UserCheck,
  LogOut,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { store } from '../../lib/store';
import { UserRole } from '../../types';
import { Badge } from '../ui/Badge';

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
    { label: 'AI Procurement Agent', path: '/agent', icon: Bot, highlight: true },
    { label: 'Product Catalogue', path: '/catalogue', icon: Package },
    { label: 'Suppliers', path: '/suppliers', icon: Truck },
    { label: 'Supplier Intelligence', path: '/intelligence', icon: SlidersHorizontal },
    { label: 'Demand Forecasting', path: '/forecasting', icon: TrendingUp },
    { label: 'Purchase Orders', path: '/orders', icon: FileText },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare, badge: store.getApprovalRequests().filter(a => a.status === 'pending').length },
    { label: 'Payments & Checkout', path: '/payments', icon: CreditCard },
    { label: 'Provenance Ledger', path: '/provenance', icon: History },
    { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: notificationsCount },
    { label: 'Administration', path: '/admin', icon: Settings, adminOnly: true }
  ];

  const currentUser = store.getCurrentUser();
  const org = store.getActiveOrganisation();

  return (
    <div className="flex min-h-screen bg-[#F5F8FC] font-sans antialiased text-slate-800">
      {/* Sidebar: Enterprise Dark Navy (#071426) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#071426] text-white flex flex-col transition-all duration-300 border-r border-navy-800 shadow-xl ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800 bg-[#06101f]">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center shadow-glow flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Procure<span className="text-brand-cyan">AI</span>
                  <span className="text-[10px] bg-brand-blue/20 text-brand-cyan px-1.5 py-0.5 rounded font-mono border border-brand-cyan/30">v1.0</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium truncate">Autonomous FinTech Agent</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Organisation Badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-navy-800/60 bg-navy-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center text-brand-cyan">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{org.name}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified Enterprise Buyer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-navy-700">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-glow'
                    : item.highlight
                    ? 'text-brand-cyan hover:bg-navy-800/80 bg-brand-cyan/5 border border-brand-cyan/20'
                    : 'text-slate-300 hover:bg-navy-800/70 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${item.highlight && !isActive ? 'text-brand-cyan animate-pulse' : ''}`} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-cyan text-navy-900">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: Sandbox Pill and User Info */}
        <div className="p-3 border-t border-navy-800 bg-[#06101f]">
          {!collapsed && (
            <div className="mb-2 p-2 rounded-lg bg-navy-800/60 border border-navy-700 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-semibold text-white">PayPal Sandbox</span>
                </span>
                <span className="text-[10px] text-brand-cyan font-mono font-bold">API v2</span>
              </div>
              <p className="text-[10px] text-slate-400">Multi-Provider AI: Gemini / OpenAI</p>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full border border-navy-700 object-cover flex-shrink-0"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.full_name}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">{currentUser.role} Workspace</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
          {/* Global Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, suppliers, purchase orders, provenance..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/catalogue?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right Header Actions: Role Switcher, Notifications & User */}
          <div className="flex items-center gap-4">
            {/* Quick Role Switcher Pill for Evaluation */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-brand-blue" /> Role:
              </span>
              {(['buyer', 'supplier', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${
                    activeRole === r
                      ? 'bg-white text-navy-900 shadow-sm font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-error text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {notificationsCount}
                </span>
              )}
            </Link>

            {/* Direct Link to PayPal Sandbox Developer Portal */}
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium"
              title="Open PayPal Sandbox Developer Portal"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PayPal Sandbox</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
};
