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
  Sparkles,
  Layers,
  Activity
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
    navigate(store.getDashboardPath(newRole));
  };

  let navItems: { label: string; path: string; icon: any; badge?: number }[] = [];

  if (activeRole === 'supplier') {
    navItems = [
      { label: 'Overview', path: '/supplier/dashboard', icon: LayoutDashboard },
      { label: 'Business Profile', path: '/supplier/dashboard?tab=profile', icon: Building2 },
      { label: 'Verification & Docs', path: '/supplier/dashboard?tab=verification', icon: ShieldCheck },
      { label: 'Product Management', path: '/supplier/dashboard?tab=products', icon: Package },
      { label: 'Inventory Management', path: '/supplier/dashboard?tab=inventory', icon: Layers },
      {
        label: 'RFQ Management',
        path: '/supplier/dashboard?tab=rfqs',
        icon: FileText,
        badge: store.getSupplierRfqs().filter(r => r.status === 'pending').length
      },
      { label: 'Quotations', path: '/supplier/dashboard?tab=quotations', icon: CheckSquare },
      {
        label: 'Purchase Orders',
        path: '/supplier/dashboard?tab=orders',
        icon: FileText,
        badge: store.getPurchaseOrders().filter(po => po.supplier_name.toLowerCase().includes('omni')).length
      },
      { label: 'Order Fulfilment', path: '/supplier/dashboard?tab=fulfilment', icon: Truck },
      { label: 'Payments & Transactions', path: '/supplier/dashboard?tab=payments', icon: CreditCard },
      { label: 'Performance Analytics', path: '/supplier/dashboard?tab=analytics', icon: BarChart3 },
      { label: 'Notifications', path: '/notifications', icon: Bell, badge: notificationsCount }
    ];
  } else if (activeRole === 'admin') {
    navItems = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'User Management', path: '/admin/dashboard?tab=users', icon: UserCheck },
      { label: 'Buyer Organisations', path: '/admin/dashboard?tab=organisations', icon: Building2 },
      {
        label: 'Supplier Verification',
        path: '/admin/dashboard?tab=verifications',
        icon: ShieldCheck,
        badge: store.getSuppliers().filter(s => s.verification_status === 'pending' || s.is_provisional).length
      },
      { label: 'Master Catalogue', path: '/admin/dashboard?tab=catalogue', icon: Package },
      { label: 'Procurement Monitor', path: '/admin/dashboard?tab=procurement', icon: Bot },
      { label: 'PayPal Settlement', path: '/admin/dashboard?tab=payments', icon: CreditCard },
      { label: 'AI Agent Governance', path: '/admin/dashboard?tab=ai', icon: Sparkles },
      { label: 'Demand Forecasting', path: '/forecasting', icon: TrendingUp },
      { label: 'Supplier Intelligence', path: '/intelligence', icon: SlidersHorizontal },
      { label: 'Provenance Ledger', path: '/provenance', icon: History },
      { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
      { label: 'System Health', path: '/admin/dashboard?tab=health', icon: Activity },
      { label: 'Platform Settings', path: '/admin', icon: Settings }
    ];
  } else {
    // Buyer
    navItems = [
      { label: 'Overview', path: '/buyer/dashboard', icon: LayoutDashboard },
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
      { label: 'Administration', path: '/admin/dashboard', icon: Settings }
    ];
  }

  const currentUser = store.getCurrentUser();
  const org = store.getActiveOrganisation();

  return (
    <div className="flex min-h-screen bg-[#F4EEE6] font-sans antialiased text-[#13110F]">
      {/* =========================================================================
          DESKTOP SIDEBAR WITH FLUID SPRING FLOW MOTION (VERITY STYLE)
         ========================================================================= */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 252 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="hidden md:flex fixed top-0 bottom-0 left-0 z-40 bg-[#13110F] text-[#EDE6DC] flex-col border-r border-[rgba(244,238,230,0.08)] select-none shadow-xl overflow-hidden"
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[rgba(244,238,230,0.08)] flex-shrink-0">
          <Link to={store.getDashboardPath(activeRole)} className="flex items-center gap-2.5 overflow-hidden group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.08 }}
              className="w-7 h-7 rounded-xl bg-[#F2C8A8] text-[#13110F] flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm"
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
                  <span className="text-sm font-bold text-[#FAF7F2] tracking-tight group-hover:text-[#F2C8A8] transition-colors">
                    ProcureAI
                  </span>
                  <span className="text-[10px] text-[#F2C8A8] font-mono font-semibold">2.0</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-[#8C847D] hover:text-[#FAF7F2] hover:bg-white/5 transition-colors"
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
              className="px-3 py-2.5 mx-2.5 my-2 rounded-xl bg-[#1C1916] border border-[rgba(244,238,230,0.08)] shadow-inner overflow-hidden"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[rgba(242,200,168,0.15)] border border-[rgba(242,200,168,0.25)] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-[#F2C8A8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#FAF7F2] truncate tracking-tight">
                    {activeRole === 'supplier'
                      ? 'OmniOffice Direct Ltd'
                      : activeRole === 'admin'
                      ? 'ProcureAI Global'
                      : org.name}
                  </p>
                  <p className="text-[10px] text-[#8C847D] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B4C7A6] animate-pulse"></span>
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

        {/* Navigation Items with Fluid Spring Flow Motion */}
        <nav
          onMouseLeave={() => setHoveredPath(null)}
          className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 relative scrollbar-thin scrollbar-thumb-[#26221F]"
        >
          {navItems.map(item => {
            const currentFull = location.pathname + location.search;
            const isActive = item.path.includes('?')
              ? currentFull === item.path || (location.pathname === item.path.split('?')[0] && !location.search && item.path.includes('overview'))
              : location.pathname === item.path;
            const isHovered = hoveredPath === item.path;

            return (
              <motion.div
                key={item.path}
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Link
                  to={item.path}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  className={`relative flex items-center gap-3 px-3 h-9 rounded-xl text-xs font-medium transition-colors select-none group ${
                    isActive
                      ? 'text-[#FAF7F2] font-semibold'
                      : 'text-[#8C847D] hover:text-[#FAF7F2]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {/* 1. Fluid Active Pill Animation (Verity Flow Motion) */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSideNavPill"
                      className="absolute inset-0 bg-[#26221F] rounded-xl -z-10 shadow-sm border border-[rgba(242,200,168,0.25)] overflow-hidden"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    >
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[#F2C8A8]" />
                    </motion.div>
                  )}

                  {/* 2. Fluid Hover Ghost Pill Animation */}
                  {isHovered && !isActive && (
                    <motion.div
                      layoutId="hoverSideNavPill"
                      className="absolute inset-0 bg-white/[0.06] border border-white/[0.04] rounded-xl -z-10 backdrop-blur-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}

                  {/* Nav Icon */}
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex-shrink-0"
                  >
                    <item.icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-[#FAF7F2]'
                          : isHovered
                          ? 'text-[#F2C8A8]'
                          : 'text-[#8C847D]'
                      }`}
                      strokeWidth={isActive ? 2 : 1.75}
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
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums font-semibold ${
                        isActive
                          ? 'bg-[#F2C8A8]/20 text-[#F2C8A8] border border-[#F2C8A8]/30 shadow-sm'
                          : 'bg-[#1C1916] text-[#8C847D] border border-[rgba(244,238,230,0.08)]'
                      }`}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[rgba(244,238,230,0.08)] space-y-2 flex-shrink-0 bg-[#0E0C0B]">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="px-2.5 py-1.5 rounded-xl bg-[#1C1916] border border-[rgba(244,238,230,0.08)] text-[11px] flex items-center justify-between text-[#8C847D]"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B4C7A6] animate-pulse"></span>
                  <span className="font-medium text-[#FAF7F2]">PayPal Orders v2</span>
                </span>
                <span className="font-mono text-[10px] text-[#B4C7A6]">Sandbox</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-full border border-[rgba(244,238,230,0.15)] object-cover flex-shrink-0"
              />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="min-w-0 flex-1"
                  >
                    <p className="text-xs font-semibold text-[#FAF7F2] truncate">{currentUser.full_name}</p>
                    <p className="text-[10px] text-[#8C847D] capitalize truncate">{currentUser.role} Portal</p>
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
                className="text-[#8C847D] hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
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
              className="md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#13110F] text-[#EDE6DC] flex flex-col border-r border-[rgba(244,238,230,0.08)] shadow-2xl"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-[rgba(244,238,230,0.08)]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#F2C8A8] text-[#13110F] flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <span className="text-sm font-bold text-[#FAF7F2] tracking-tight">ProcureAI 2.0</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-[#8C847D] hover:text-[#FAF7F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map(item => {
                  const currentFull = location.pathname + location.search;
                  const isActive = item.path.includes('?')
                    ? currentFull === item.path || (location.pathname === item.path.split('?')[0] && !location.search && item.path.includes('overview'))
                    : location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#26221F] text-[#FAF7F2] font-semibold border border-[rgba(242,200,168,0.25)]'
                          : 'text-[#8C847D] hover:text-[#FAF7F2] hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F2C8A8]/20 text-[#F2C8A8]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[rgba(244,238,230,0.08)] flex items-center justify-between">
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
        {/* Top Header - Verity Frosted Warm Bar */}
        <header className="h-14 bg-[#F4EEE6]/85 backdrop-blur-xl border-b border-[rgba(19,17,15,0.08)] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          {/* Mobile Menu Trigger & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-[#6B6560] hover:bg-[#EDE6DC]"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#8C847D] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
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
                className="w-full pl-8 pr-11 py-1.5 bg-white/90 hover:bg-white focus:bg-white border border-[rgba(19,17,15,0.1)] rounded-xl text-xs text-[#13110F] placeholder-[#8C847D] focus:outline-none focus:ring-2 focus:ring-[#13110F]/15 focus:border-[#13110F] transition-all shadow-subtle"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-[#EDE6DC] border border-[rgba(19,17,15,0.1)] rounded text-[9px] font-mono text-[#6B6560] select-none">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authenticated Portal Badge & Role Switcher with Fluid Spring Flow Motion */}
            <div className="flex items-center bg-[#EDE6DC] p-0.5 rounded-xl border border-[rgba(19,17,15,0.08)] relative shadow-subtle">
              <span className="text-[11px] font-medium text-[#6B6560] px-2 hidden sm:flex items-center gap-1 select-none">
                <UserCheck className="w-3 h-3 text-[#8C847D]" /> Portal:
              </span>
              {(['buyer', 'supplier', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`relative text-[11px] px-3 py-1 rounded-lg font-medium transition-colors capitalize select-none z-10 ${
                    activeRole === r ? 'text-[#13110F] font-semibold' : 'text-[#6B6560] hover:text-[#13110F]'
                  }`}
                >
                  {activeRole === r && (
                    <motion.div
                      layoutId="activeRoleFlowPill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-[rgba(19,17,15,0.08)] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  {r}
                </button>
              ))}
              <Link
                to={`/login?role=${activeRole}`}
                className="text-[10px] text-[#13110F] hover:text-[#26221F] font-medium px-2.5 border-l border-[rgba(19,17,15,0.1)] hover:underline z-10"
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
              className="p-1.5 rounded-lg text-[#6B6560] hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
              title="Sign out of portal"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-1.5 rounded-lg text-[#6B6560] hover:text-[#13110F] hover:bg-[#EDE6DC] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#BE123C] rounded-full animate-pulse"></span>
              )}
            </Link>

            {/* PayPal Sandbox External Link */}
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-[#3E5C31] bg-[rgba(180,199,166,0.22)] hover:bg-[rgba(180,199,166,0.35)] px-2.5 py-1.5 rounded-xl border border-[rgba(180,199,166,0.6)] transition-colors shadow-subtle"
              title="Open PayPal Sandbox Developer Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#3E5C31]" />
              <span className="font-medium">Sandbox</span>
              <ExternalLink className="w-3 h-3 text-[#3E5C31]/60" />
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
