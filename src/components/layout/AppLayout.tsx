import React, { useState, useEffect, useRef } from 'react';
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
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { store } from '../../lib/store';
import { UserRole, NotificationItem } from '../../types';
import { FloatingAIAssistant } from '../ai/FloatingAIAssistant';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>(store.getCurrentUser().role);
  const [notifications, setNotifications] = useState<NotificationItem[]>(store.getNotifications());
  const [notificationsCount, setNotificationsCount] = useState(
    store.getNotifications().filter(n => !n.is_read).length
  );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setActiveRole(store.getCurrentUser().role);
      const currentNotifs = store.getNotifications();
      setNotifications(currentNotifs);
      setNotificationsCount(currentNotifs.filter(n => !n.is_read).length);
    });
    return unsubscribe;
  }, []);

  // Close notifications box on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer and notification popover on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'payment_success':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'payment_failed':
        return <CreditCard className="w-4 h-4 text-rose-600" />;
      case 'approved':
      case 'approval_needed':
        return <CheckSquare className="w-4 h-4 text-[#9C5A2B]" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'rfq':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'order_dispatched':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'ai_completed':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#6B6560]" />;
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    // 1. Mark as read
    store.markNotificationAsRead(notif.id);
    const updated = store.getNotifications();
    setNotifications(updated);
    setNotificationsCount(updated.filter(n => !n.is_read).length);

    // 2. Close dropdown box
    setIsNotificationsOpen(false);

    // 3. Direct to respective process or operation
    if (notif.link_url) {
      navigate(notif.link_url);
      return;
    }

    if (activeRole === 'supplier') {
      if (notif.type === 'rfq') navigate('/supplier/dashboard?tab=rfqs');
      else if (notif.type === 'order_dispatched') navigate('/supplier/dashboard?tab=fulfilment');
      else if (notif.type === 'payment_success') navigate('/supplier/dashboard?tab=payments');
      else navigate('/supplier/dashboard');
    } else if (activeRole === 'admin') {
      if (notif.type === 'approval_needed') navigate('/admin/dashboard?tab=verifications');
      else if (notif.type === 'approved') navigate('/admin/dashboard?tab=organisations');
      else if (notif.type === 'payment_success') navigate('/admin/dashboard?tab=payments');
      else navigate('/admin/dashboard');
    } else {
      if (notif.type === 'payment_success') navigate('/payments');
      else if (notif.type === 'approved' || notif.type === 'approval_needed') navigate('/approvals');
      else if (notif.type === 'low_stock') navigate('/forecasting');
      else navigate('/orders');
    }
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
      { label: 'Performance Analytics', path: '/supplier/dashboard?tab=analytics', icon: BarChart3 }
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
        label: 'Authorizations',
        path: '/approvals',
        icon: CheckSquare,
        badge: store.getApprovalRequests().filter(a => a.status === 'pending').length
      },
      { label: 'Payments & Checkout', path: '/payments', icon: CreditCard },
      { label: 'Provenance Ledger', path: '/provenance', icon: History },
      { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
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
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-[rgba(244,238,230,0.08)] flex-shrink-0">
          <Link to={store.getDashboardPath(activeRole)} className="flex items-center gap-2 overflow-hidden group">
            {collapsed ? (
              <motion.div
                whileHover={{ rotate: 6, scale: 1.08 }}
                className="w-8 h-8 rounded-xl bg-white/[0.05] p-1 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-sm"
              >
                <img
                  src="/procureai-icon.png"
                  alt="ProcureAI"
                  className="w-6 h-6 object-contain"
                />
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-1.5"
              >
                <img
                  src="/procureai-logo.png"
                  alt="ProcureAI"
                  className="h-7 w-auto object-contain"
                />
                <span className="text-[10px] text-[#F2C8A8] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                  2.0
                </span>
              </motion.div>
            )}
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
                  <img
                    src="/procureai-logo.png"
                    alt="ProcureAI"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="text-[10px] text-[#F2C8A8] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                    2.0
                  </span>
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
            {/* Authenticated Portal & Verified Session Badge */}
            <div className="flex items-center gap-2 bg-[#EDE6DC] px-2.5 py-1 rounded-xl border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-[#B4C7A6] animate-pulse"></span>
              <span className="text-[11px] font-semibold text-[#13110F] hidden sm:inline">
                {activeRole === 'admin'
                  ? 'Root Admin Control Tower'
                  : activeRole === 'supplier'
                  ? 'Supplier Fulfillment Hub'
                  : 'Enterprise Buyer Portal'}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#6B6560] border border-[rgba(19,17,15,0.08)] uppercase">
                {activeRole}
              </span>
              <button
                onClick={() => {
                  store.logout();
                  navigate('/login');
                }}
                className="text-[10px] text-[#8C847D] hover:text-[#13110F] pl-1.5 font-medium transition-colors border-l border-[rgba(19,17,15,0.12)] ml-0.5"
                title="Switch portal account via authenticated login"
              >
                Switch
              </button>
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

            {/* Notification Menu Bell & Interactive Dropdown Box */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setNotifications(store.getNotifications());
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className={`relative p-2 rounded-xl transition-all ${
                  isNotificationsOpen
                    ? 'bg-[#13110F] text-[#FAF7F2] shadow-sm'
                    : 'text-[#6B6560] hover:text-[#13110F] hover:bg-[#EDE6DC]'
                }`}
                title="Notifications"
                aria-label="Open notifications box"
              >
                <Bell className="w-4 h-4" strokeWidth={1.75} />
                {notificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#BE123C] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#F4EEE6] shadow-sm animate-pulse">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Box Under The Bell */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-2xl shadow-2xl z-50 overflow-hidden font-sans select-none"
                  >
                    {/* Popover Header */}
                    <div className="px-4 py-3 bg-[#13110F] text-[#FAF7F2] flex items-center justify-between border-b border-[rgba(244,238,230,0.1)]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#F2C8A8]" />
                        <span className="text-xs font-bold tracking-tight">Notifications</span>
                        {notificationsCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-[#F2C8A8]/20 text-[#F2C8A8] text-[10px] font-mono font-semibold rounded-md border border-[#F2C8A8]/30">
                            {notificationsCount} new
                          </span>
                        )}
                      </div>
                      {notificationsCount > 0 && (
                        <button
                          onClick={() => {
                            store.markAllNotificationsAsRead();
                            const currentNotifs = store.getNotifications();
                            setNotifications(currentNotifs);
                            setNotificationsCount(0);
                          }}
                          className="text-[11px] text-[#EDE6DC]/85 hover:text-[#F2C8A8] transition-colors flex items-center gap-1 font-medium hover:underline"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#B4C7A6]" />
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-[rgba(19,17,15,0.06)] bg-[#FAF7F2]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-[#EDE6DC] flex items-center justify-center mx-auto text-[#6B6560]">
                            <CheckCircle2 className="w-5 h-5 text-[#3E5C31]" />
                          </div>
                          <p className="text-xs font-semibold text-[#13110F]">All caught up!</p>
                          <p className="text-[11px] text-[#8C847D]">No pending notifications for your portal.</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 text-left group hover:bg-[#EDE6DC]/70 ${
                              !n.is_read ? 'bg-[#F2C8A8]/12 font-medium' : 'bg-transparent opacity-85'
                            }`}
                          >
                            {/* Type Icon */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                              !n.is_read
                                ? 'bg-[#13110F] text-[#F2C8A8]'
                                : 'bg-[#EDE6DC] text-[#6B6560]'
                            }`}>
                              {getNotificationIcon(n.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs truncate tracking-tight ${!n.is_read ? 'font-bold text-[#13110F]' : 'font-medium text-[#4A4540]'}`}>
                                  {n.title}
                                </p>
                                {!n.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-[#BE123C] flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#6B6560] line-clamp-2 mt-0.5 leading-snug">
                                {n.message}
                              </p>
                              <div className="flex items-center justify-between mt-2 text-[10px]">
                                <span className="text-[#8C847D] font-mono">
                                  {formatNotificationTime(n.created_at)}
                                </span>
                                <span className="inline-flex items-center gap-1 font-semibold text-[#13110F] group-hover:text-[#9C5A2B] group-hover:translate-x-0.5 transition-all">
                                  Go to process <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
