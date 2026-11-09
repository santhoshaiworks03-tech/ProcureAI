import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  CreditCard,
  Clock,
  Truck,
  ArrowRight,
  ShieldCheck,
  Bot,
  Package,
  Building,
  Building2,
  CheckCircle2,
  ExternalLink,
  Plus,
  AlertTriangle,
  Layers,
  Activity,
  History,
  FileText,
  Sparkles,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { ProcurementWorkflowJourney } from '../../components/workflow/ProcurementWorkflowJourney';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { store } from '../../lib/store';
import { UserRole, PurchaseOrder, Supplier, SupplierProduct, ProvenanceEvent } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(store.getCurrentUser().role);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(store.getPurchaseOrders());
  const [suppliers, setSuppliers] = useState<Supplier[]>(store.getSuppliers());
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>(store.getSupplierProducts());
  const [provenanceEvents, setProvenanceEvents] = useState<ProvenanceEvent[]>(store.getProvenanceEvents());
  const org = store.getActiveOrganisation();

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentRole(store.getCurrentUser().role);
      setPurchaseOrders(store.getPurchaseOrders());
      setSuppliers(store.getSuppliers());
      setSupplierProducts(store.getSupplierProducts());
      setProvenanceEvents(store.getProvenanceEvents());
    });
    return unsub;
  }, []);

  // ---------------------------------------------------------------------------
  // 1. BUSINESS BUYER DASHBOARD
  // ---------------------------------------------------------------------------
  const renderBuyerDashboard = () => {
    const totalSpend = purchaseOrders
      .filter(po => po.status === 'payment_completed' || po.status === 'delivered')
      .reduce((sum, po) => sum + po.total_amount, 0);

    const pendingApprovals = purchaseOrders.filter(po => po.status === 'pending_approval').length;
    const pendingPayments = purchaseOrders.filter(
      po => po.status === 'approved' || po.status === 'payment_pending'
    ).length;
    const aiIdentifiedSavings = 248500;
    const budgetUtilization = Math.round((totalSpend / org.annual_procurement_budget) * 100);

    const monthlySpendData = [
      { month: 'Oct', spend: 180000, aiSavings: 24000 },
      { month: 'Nov', spend: 320000, aiSavings: 45000 },
      { month: 'Dec', spend: 410000, aiSavings: 58000 },
      { month: 'Jan', spend: 290000, aiSavings: 38000 },
      { month: 'Feb', spend: 540000, aiSavings: 72000 },
      { month: 'Mar', spend: totalSpend > 0 ? totalSpend : 390110, aiSavings: aiIdentifiedSavings }
    ];

    const categoryData = [
      { name: 'Ergonomic Seating', value: 382500 },
      { name: 'Standing Desks', value: 295000 },
      { name: 'Storage Cabinets', value: 168000 },
      { name: 'Displays & IT', value: 472500 },
      { name: 'AV & Peripherals', value: 89000 }
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Procurement Overview</h1>
              <Badge variant="neutral" size="sm">Buyer Workspace</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Q1 2026 • {org.name} • Annual Budget {formatCurrency(org.annual_procurement_budget)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/agent">
              <Button variant="primary" size="sm" leftIcon={<Bot className="w-3.5 h-3.5" />}>
                New autonomous request
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Insight Callout */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-violet-50/60 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">AI Autonomous Sourcing Intelligence</span>
              <span className="text-slate-600 text-[11px]">
                ProcureAI agent has negotiated ₹2,48,500 in cumulative discounts across 8 orders with 100% compliant budget limits.
              </span>
            </div>
          </div>
          <Link to="/agent">
            <Button variant="outline" size="sm" className="bg-white text-xs">
              Open Agent Terminal
            </Button>
          </Link>
        </div>

        {/* Stat Cards - Verity Elevated SaaS System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Settled
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Total gross spend</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              {formatCurrency(totalSpend)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Settled across verified orders</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-amber-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <Clock className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Action Required
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Pending approvals</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              {pendingApprovals}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Requires management sign-off</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-indigo-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> 5-Min Lock
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Pending checkout</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              {pendingPayments}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">5-min PayPal session active</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-emerald-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 7.4% Savings
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">AI-negotiated savings</span>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1 tabular-nums font-mono tracking-tight">
              {formatCurrency(aiIdentifiedSavings)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">7.4% under benchmark price ceilings</p>
          </motion.div>
        </div>

        {/* Embedded Animated Workflow Journey */}
        <ProcurementWorkflowJourney currentActiveStage={6} interactive={true} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 border-slate-200/80 space-y-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Spending velocity & AI savings</h3>
                <p className="text-[11px] text-slate-400">Monthly billing cycles</p>
              </div>
              <Badge variant="neutral" size="sm">6-Month Trend</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySpendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `₹${v / 1000}k`} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: '#07090E',
                      color: '#F8FAFC',
                      borderRadius: '8px',
                      fontSize: '11px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="spend" name="Gross spend" stroke="#1D4ED8" fill="#1D4ED8" fillOpacity={0.12} strokeWidth={2} />
                  <Area type="monotone" dataKey="aiSavings" name="AI savings" stroke="#16A36A" fill="#16A36A" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 border-slate-200/80 space-y-4 flex flex-col justify-between rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-900">Budget allocation</h3>
                <span className="text-xs font-mono font-medium text-slate-700 tabular-nums">
                  {budgetUtilization}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-5">
                <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, budgetUtilization)}%` }}></div>
              </div>

              <h4 className="text-xs font-semibold text-slate-900 mb-2.5">Category distribution</h4>
              <div className="space-y-2 text-xs">
                {categoryData.map(c => (
                  <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 text-[11px]">{c.name}</span>
                    <span className="font-mono text-slate-800 text-[11px] tabular-nums font-semibold">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/analytics" className="pt-2">
              <Button variant="outline" size="sm" className="w-full rounded-xl" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Detailed analytics
              </Button>
            </Link>
          </Card>
        </div>

        {/* Recent Purchase Orders - Verity Style Table */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Recent purchase orders</h3>
              <p className="text-[11px] text-slate-400">Track real-time purchase order settlement and dispatch status</p>
            </div>
            <Link to="/orders" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              View all orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-500 text-[10px] font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">PO number</th>
                  <th className="py-3 px-4 font-semibold">Supplier</th>
                  <th className="py-3 px-4 font-semibold text-center">Items</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.slice(0, 5).map(po => {
                  const initials = po.supplier_name.split(' ').map(n => n[0]).slice(0, 2).join('');
                  return (
                    <tr key={po.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-900 block">{po.po_number}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(po.created_at)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-subtle">
                            {initials}
                          </div>
                          <div>
                            <span className="font-medium text-slate-800 block">{po.supplier_name}</span>
                            <span className="text-[10px] text-slate-400">Verified Partner</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-mono tabular-nums">{po.items.length} units</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono tabular-nums">{formatCurrency(po.total_amount)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            po.status === 'payment_completed' || po.status === 'delivered'
                              ? 'success'
                              : po.status === 'pending_approval'
                              ? 'warning'
                              : 'neutral'
                          }
                          dot
                          size="sm"
                        >
                          {po.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {po.status === 'approved' ? (
                          <Link to={`/payments?po=${po.id}`}>
                            <Button variant="primary" size="sm" className="rounded-lg shadow-sm">Pay</Button>
                          </Link>
                        ) : (
                          <Link to={`/orders?id=${po.id}`}>
                            <Button variant="outline" size="sm" className="rounded-lg">View</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // 2. SUPPLIER DASHBOARD
  // ---------------------------------------------------------------------------
  const renderSupplierDashboard = () => {
    // Current supplier: OmniOffice Direct
    const mySupplier = suppliers.find(s => s.id === 'sup-01') || suppliers[0];
    const incomingOrders = purchaseOrders.filter(
      po => po.supplier_id === mySupplier.id || po.supplier_name.includes('Omni')
    );
    const settledRevenue = incomingOrders
      .filter(po => po.status === 'payment_completed' || po.status === 'delivered' || po.status === 'shipped')
      .reduce((sum, po) => sum + po.total_amount, 862500);
    const toDispatchCount = incomingOrders.filter(
      po => po.status === 'confirmed' || po.status === 'approved' || po.status === 'payment_completed'
    ).length;
    const myListings = supplierProducts.filter(sp => sp.supplier_id === mySupplier.id);

    const handleDispatch = async (poId: string) => {
      await store.updatePurchaseOrderStatus(poId, 'shipped', {
        courier: 'BlueDart Express',
        tracking_number: `BD-IN-${Date.now().toString().slice(-8)}`
      });
    };

    const handleDeliver = async (poId: string) => {
      await store.updatePurchaseOrderStatus(poId, 'delivered', {
        delivered_at: new Date().toISOString()
      });
    };

    const handleRestock = (listingId: string) => {
      store.updateSupplierProductStock(listingId, 25);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Supplier Fulfillment Hub</h1>
              <Badge variant="success" dot size="sm">Vendor Portal</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {mySupplier.company_name} • GSTIN: {mySupplier.gstin_tax_id} • Verified Commercial Vendor
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="neutral">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
              PayPal Merchant Verified
            </Badge>
          </div>
        </div>

        {/* Stat Cards - Verity Supplier Fulfillment System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-emerald-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Merchant Capture
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Settled PayPal revenue</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              {formatCurrency(settledRevenue)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Instant merchant capture</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-amber-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <Clock className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending Action
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Orders to fulfill</span>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1 tabular-nums font-mono tracking-tight">
              {toDispatchCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting dispatch or delivery</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <Package className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Contracted
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Active catalogue listings</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              {myListings.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Contracted enterprise SKUs</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-emerald-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tier-1 SLA
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Fulfillment SLA score</span>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1 tabular-nums font-mono tracking-tight">
              98.4%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Quality {mySupplier.quality_score}% · Rating {mySupplier.delivery_rating}/5.0</p>
          </motion.div>
        </div>

        {/* Incoming Orders to Fulfill - Verity Table */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Incoming enterprise orders</h3>
              <p className="text-[11px] text-slate-400">Accept, dispatch, and track payment settlement in real time</p>
            </div>
            <Badge variant="neutral" size="sm">{incomingOrders.length} orders total</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-500 text-[10px] font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">PO number</th>
                  <th className="py-3 px-4 font-semibold">Buyer organisation</th>
                  <th className="py-3 px-4 font-semibold">Delivery destination</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Order status</th>
                  <th className="py-3 px-4 font-semibold text-right">Fulfillment action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomingOrders.map(po => {
                  const buyerName = po.organisation_name || org.name;
                  const initials = buyerName.split(' ').map((n: string) => n[0]).slice(0, 2).join('');
                  return (
                    <tr key={po.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-900 block">{po.po_number}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(po.created_at)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-subtle">
                            {initials}
                          </div>
                          <div>
                            <span className="font-medium text-slate-800 block">{buyerName}</span>
                            <span className="text-[10px] text-slate-400">Enterprise Tenant</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{po.delivery_address.city}, {po.delivery_address.state}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono tabular-nums">{formatCurrency(po.total_amount)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            po.status === 'delivered'
                              ? 'success'
                              : po.status === 'shipped'
                              ? 'info'
                              : po.status === 'payment_completed' || po.status === 'confirmed'
                              ? 'warning'
                              : 'neutral'
                          }
                          dot
                          size="sm"
                        >
                          {po.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {po.status === 'payment_completed' || po.status === 'confirmed' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="rounded-lg shadow-sm"
                              onClick={() => handleDispatch(po.id)}
                              leftIcon={<Truck className="w-3.5 h-3.5" />}
                            >
                              Dispatch
                            </Button>
                          ) : po.status === 'shipped' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => handleDeliver(po.id)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            >
                              Mark delivered
                            </Button>
                          ) : (
                            <Link to={`/orders?id=${po.id}`}>
                              <Button variant="outline" size="sm" className="rounded-lg">Details</Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Stock & PayPal Merchant Account Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-4 border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Catalogue stock management</h3>
                <p className="text-[11px] text-slate-400">Manage real-time inventory depth for autonomous matching</p>
              </div>
              <Link to="/catalogue">
                <Button variant="outline" size="sm">Catalogue</Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 text-[11px]">
                  <tr>
                    <th className="py-2 px-3 font-medium">Product item</th>
                    <th className="py-2 px-3 font-medium text-right">Unit price</th>
                    <th className="py-2 px-3 font-medium text-center">Available stock</th>
                    <th className="py-2 px-3 text-right">Quick action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myListings.slice(0, 4).map(item => (
                    <tr key={item.id}>
                      <td className="py-2 px-3">
                        <span className="font-medium text-slate-900 block">{item.product?.name || 'Enterprise Hardware'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {item.supplier_sku}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-800">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant={item.available_stock > 20 ? 'neutral' : 'warning'} size="sm" dot>
                          <span className="tabular-nums font-mono">{item.available_stock} units</span>
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestock(item.id)}
                          leftIcon={<Plus className="w-3 h-3 text-slate-500" />}
                        >
                          +25 stock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* PayPal Settlement Settings Card */}
          <Card className="p-4 border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-semibold text-slate-900">PayPal merchant account</h3>
              </div>
              <Badge variant="success" dot size="sm">Active</Badge>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Merchant ID:</span>
                <span className="text-slate-900 font-semibold">{mySupplier.paypal_merchant_id || 'PPL-MERCH-OMNI-01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Settlement email:</span>
                <span className="text-slate-700">{mySupplier.paypal_email || mySupplier.contact_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Payment terms:</span>
                <span className="text-slate-900">{mySupplier.payment_terms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Payout pipeline:</span>
                <span className="text-emerald-700">Orders v2 Capture</span>
              </div>
            </div>

            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 pt-1"
            >
              Open PayPal Developer portal <ExternalLink className="w-3 h-3" />
            </a>
          </Card>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // 3. PLATFORM ADMINISTRATOR DASHBOARD
  // ---------------------------------------------------------------------------
  const renderAdminDashboard = () => {
    const totalPlatformGMV = 12450000;
    const verifiedSuppliers = suppliers.filter(s => s.verification_status === 'verified').length;
    const provisionalSuppliers = suppliers.filter(s => s.is_provisional || s.verification_status === 'pending').length;

    const handleVerify = (id: string, status: 'verified' | 'rejected') => {
      store.updateSupplierVerification(id, status);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Operations & Governance</h1>
              <Badge variant="neutral" size="sm">Root Admin</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Global Control Tower • Multi-Tenant Enterprise Procurement & PayPal Settlement
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                System configuration
              </Button>
            </Link>
          </div>
        </div>

        {/* Stat Cards - Verity Global Control Tower */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-emerald-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Settlement
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Platform GMV settled</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              {formatCurrency(totalPlatformGMV)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">PayPal Orders v2 capture</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Multi-Tenant RLS
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Registered enterprises</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              3 tenants
            </p>
            <p className="text-[11px] text-slate-400 mt-1">PostgreSQL RLS isolated</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-indigo-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <Truck className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> KYC Verified
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Commercial suppliers</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              {suppliers.length} vendors
            </p>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">{verifiedSuppliers} verified · {provisionalSuppliers} review</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:border-violet-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 border border-violet-200/70 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> SHA-256 Chained
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500 block">Cryptographic blocks</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums font-mono tracking-tight">
              {provenanceEvents.length} blocks
            </p>
            <p className="text-[11px] text-slate-400 mt-1">SHA-256 chained ledger</p>
          </motion.div>
        </div>

        {/* Supplier Verification Queue - Verity Enterprise Table */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-semibold text-slate-900">Supplier legal verification & KYC queue</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Review business registration, GSTIN, and PayPal settlement accounts</p>
            </div>
            <Link to="/suppliers" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              View directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-500 text-[10px] font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Company name</th>
                  <th className="py-3 px-4 font-semibold">GSTIN / Tax ID</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">City</th>
                  <th className="py-3 px-4 font-semibold text-center">Audit status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map(sup => {
                  const initials = sup.company_name.split(' ').map(n => n[0]).slice(0, 2).join('');
                  return (
                    <tr key={sup.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-subtle">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{sup.company_name}</span>
                            <span className="text-[10px] text-slate-400">PayPal Settlement Enabled</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60 inline-block font-semibold">
                          {sup.gstin_tax_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-xs">{sup.business_category}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          {sup.address.city}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            sup.verification_status === 'verified'
                              ? 'success'
                              : sup.verification_status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                          dot
                          size="sm"
                        >
                          {sup.verification_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sup.verification_status !== 'verified' && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="rounded-lg shadow-sm"
                              onClick={() => handleVerify(sup.id, 'verified')}
                            >
                              Verify
                            </Button>
                          )}
                          {sup.verification_status !== 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
                              onClick={() => handleVerify(sup.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Architecture & Real-Time Audit Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Architecture Status */}
          <Card className="p-4 border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-semibold text-slate-900">Platform infrastructure health</h3>
              <Badge variant="success" dot size="sm">All operational</Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900 block">Supabase PostgreSQL Database</span>
                  <span className="text-[11px] text-slate-500">28 core relational tables with Row Level Security</span>
                </div>
                <Badge variant="success" size="sm">Enforced</Badge>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900 block">PayPal Orders API v2 Gateway</span>
                  <span className="text-[11px] text-slate-500">Server-side capture with verified webhook dispatcher</span>
                </div>
                <Badge variant="success" size="sm">Verified</Badge>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900 block">AI Multi-Provider Service Layer</span>
                  <span className="text-[11px] text-slate-500">Google Gemini 1.5 Pro with deterministic optimization fallback</span>
                </div>
                <Badge variant="success" size="sm">Ready</Badge>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900 block">Cryptographic Provenance Engine</span>
                  <span className="text-[11px] text-slate-500">Continuous SHA-256 hash chaining verification</span>
                </div>
                <Badge variant="success" size="sm">Immutable</Badge>
              </div>
            </div>
          </Card>

          {/* Real-time Provenance Feed */}
          <Card className="p-4 border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-semibold text-slate-900">Cryptographic audit log stream</h3>
              </div>
              <Link to="/provenance">
                <Button variant="outline" size="sm">Full ledger</Button>
              </Link>
            </div>

            <div className="space-y-2">
              {provenanceEvents.slice(0, 4).map(evt => (
                <div key={evt.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">#{evt.event_number.toString().padStart(4, '0')}</span>
                      <span className="font-semibold text-slate-900 text-[11px]">{evt.event_type.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{evt.verification_reference}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">{formatDate(evt.created_at)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // MAIN ROUTING BY CURRENT ROLE
  // ---------------------------------------------------------------------------
  return (
    <div>
      {currentRole === 'supplier'
        ? renderSupplierDashboard()
        : currentRole === 'admin'
        ? renderAdminDashboard()
        : renderBuyerDashboard()}
    </div>
  );
};
