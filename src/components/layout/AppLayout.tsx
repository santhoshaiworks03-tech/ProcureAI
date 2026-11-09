import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { store } from '../../lib/store';
import { UserRole } from '../../types';
import { FloatingAIAssistant } from '../ai/FloatingAIAssistant';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      {/* =========================================================================
          DESKTOP SIDEBAR WITH FLUID SPRING FLOW MOTION
         ========================================================================= */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 252 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="hidden md:flex fixed top-0 bottom-0 left-0 z-40 bg-[#0D111A] text-slate-300 flex-col border-r border-[#1B2230] select-none shadow-xl overflow-hidden"
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#1B2230] flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.08 }}
              className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm shadow-blue-500/30"
            >
              P
            </motion.div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-baseline gap-1.5 whitespace-nowrap"
                >
                  <span className="text-sm font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                    ProcureAI
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono font-semibold">2.0</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </motion.div>
          </button>
        </div>

        {/* Current Organization Info Card */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="px-3 py-2.5 mx-2 my-2 rounded-xl bg-[#141A26] border border-[#1E2638] overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {activeRole === 'supplier'
                      ? 'OmniOffice Direct Ltd'
                      : activeRole === 'admin'
                      ? 'ProcureAI Global'
                      : org.name}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="truncate">
                      {activeRole === 'supplier'
                        ? 'Verified Supplier Partner'
                        : activeRole === 'admin'
                        ? 'Root Administrator'
                        : 'Verified Enterprise'}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Items with Fluid Layout Animations */}
        <nav
          onMouseLeave={() => setHoveredPath(null)}
          className="flex-1 overflow-y-auto px-2 py-2 space-y-1 relative scrollbar-thin scrollbar-thumb-slate-800"
        >
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredPath(item.path)}
                className={`relative flex items-center gap-3 px-3 h-9 rounded-xl text-xs font-medium transition-colors select-none ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* 1. Fluid Active Pill Animation (Flow Motion) */}
                {isActive && (
                  <motion.div
                    layoutId="activeSideNavPill"
                    className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-sm shadow-blue-500/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                {/* 2. Fluid Hover Ghost Pill Animation (Flow Motion) */}
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="hoverSideNavPill"
                    className="absolute inset-0 bg-white/[0.06] rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}

                {/* Nav Icon */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex-shrink-0"
                >
                  <item.icon
                    className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`}
                    strokeWidth={1.75}
                  />
                </motion.div>

                {/* Nav Label with Fade & Slide Motion */}
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 truncate tracking-tight"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1B2230] space-y-2 flex-shrink-0 bg-[#0A0D15]">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="px-2.5 py-1.5 rounded-lg bg-[#141A26] border border-[#1E2638] text-[11px] flex items-center justify-between text-slate-400"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-medium text-slate-300">PayPal Orders v2</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400">Sandbox</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-full border border-slate-700 object-cover flex-shrink-0"
              />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="min-w-0 flex-1"
                  >
                    <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.full_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize truncate">{currentUser.role} Portal</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!collapsed && (
              <button
                onClick={() => {
                  store.logout();
                  navigate('/login');
                }}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Sign out of portal"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* =========================================================================
          MOBILE SLIDE-OUT DRAWER WITH FLUID FLOW MOTION
         ========================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Mobile Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0D111A] text-slate-300 flex flex-col border-r border-[#1B2230] shadow-2xl"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-[#1B2230]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight">ProcureAI 2.0</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/20 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#1B2230] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-7 h-7 rounded-full border border-slate-700"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-white">{currentUser.full_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{currentUser.role} Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    store.logout();
                    navigate('/login');
                  }}
                  className="text-slate-400 hover:text-rose-400 p-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MAIN CONTAINER WITH MATCHING SPRING MARGIN MOTION
         ========================================================================= */}
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 76 : 252 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="flex-1 flex flex-col min-h-screen w-full md:w-auto"
      >
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          {/* Mobile Menu Trigger & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search catalogue, orders, suppliers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/catalogue?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authenticated Portal Badge & Role Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 px-2 hidden sm:flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" /> Portal:
              </span>
              {(['buyer', 'supplier', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all capitalize ${
                    activeRole === r
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
              <Link
                to={`/login?role=${activeRole}`}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-medium px-2 border-l border-slate-200 hover:underline"
                title="Switch via dedicated portal login"
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
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full animate-pulse"></span>
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
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Global Floating AI Assistant */}
        <FloatingAIAssistant />
      </motion.div>
    </div>
  );
};
