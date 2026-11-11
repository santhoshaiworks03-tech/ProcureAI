import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles
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
import { PurchaseOrder, Supplier, SupplierProduct, ProvenanceEvent } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';

export const BuyerDashboard: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => store.getPurchaseOrders());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => store.getSuppliers());
  const org = useMemo(() => store.getActiveOrganisation(), []);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setPurchaseOrders(store.getPurchaseOrders());
      setSuppliers(store.getSuppliers());
    });
    return unsub;
  }, []);

  const { totalSpend, pendingApprovals, pendingPayments, aiIdentifiedSavings, budgetUtilization } = useMemo(() => {
    return store.getBuyerDashboardMetrics();
  }, [purchaseOrders]);

  const monthlySpendData = useMemo(() => [
    { month: 'Oct', spend: 180000, aiSavings: 24000 },
    { month: 'Nov', spend: 320000, aiSavings: 45000 },
    { month: 'Dec', spend: 410000, aiSavings: 58000 },
    { month: 'Jan', spend: 290000, aiSavings: 38000 },
    { month: 'Feb', spend: 540000, aiSavings: 72000 },
    { month: 'Mar', spend: totalSpend > 0 ? totalSpend : 390110, aiSavings: aiIdentifiedSavings }
  ], [totalSpend, aiIdentifiedSavings]);

  const categoryData = useMemo(() => [
    { name: 'Ergonomic Seating', value: 382500 },
    { name: 'Standing Desks', value: 295000 },
    { name: 'Storage Cabinets', value: 168000 },
    { name: 'Displays & IT', value: 472500 },
    { name: 'AV & Peripherals', value: 89000 }
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(19,17,15,0.08)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#13110F]">Procurement Overview</h1>
            <Badge variant="neutral" size="sm">Buyer Workspace</Badge>
          </div>
          <p className="text-xs text-[#6B6560] mt-0.5">
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

      {/* AI Autonomous Sourcing Intelligence Banner */}
      <div className="p-4 rounded-2xl bg-[#EDE6DC] border border-[rgba(19,17,15,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#13110F] text-[#FAF7F2] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#F2C8A8]" />
          </div>
          <div>
            <span className="font-semibold text-[#13110F] block text-xs">AI Autonomous Sourcing Intelligence</span>
            <span className="text-[#6B6560] text-[11px]">
              ProcureAI agent has negotiated {formatCurrency(aiIdentifiedSavings)} in cumulative discounts across 8 orders with 100% compliant budget limits.
            </span>
          </div>
        </div>
        <Link to="/agent">
          <Button variant="secondary" size="sm" className="whitespace-nowrap text-xs">
            Open Agent Terminal
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EDE6DC] text-[#13110F] border border-[rgba(19,17,15,0.08)] flex items-center justify-center flex-shrink-0 shadow-subtle">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#EDE6DC] text-[#13110F] border border-[rgba(19,17,15,0.08)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#13110F] animate-pulse" /> Settled
            </span>
          </div>
          <span className="text-xs font-medium text-[#6B6560] block">Total spend</span>
          <p className="text-2xl sm:text-3xl font-bold text-[#13110F] mt-1 tabular-nums font-mono tracking-tight">
            {formatCurrency(totalSpend > 0 ? totalSpend : 390110)}
          </p>
          <p className="text-[11px] text-[#8C847D] mt-1">Settled across verified orders</p>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgba(217,119,6,0.10)] text-[#92400E] border border-[rgba(217,119,6,0.20)] flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(217,119,6,0.10)] text-[#92400E] border border-[rgba(217,119,6,0.20)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" /> Action Required
            </span>
          </div>
          <span className="text-xs font-medium text-[#6B6560] block">Pending approvals</span>
          <p className="text-2xl sm:text-3xl font-bold text-[#13110F] mt-1 tabular-nums font-mono tracking-tight">
            {pendingApprovals}
          </p>
          <p className="text-[11px] text-[#8C847D] mt-1">Requires management sign-off</p>
        </motion.div>

        {/* Pending Checkout */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgba(242,200,168,0.25)] text-[#8C522A] border border-[rgba(242,200,168,0.4)] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(242,200,168,0.25)] text-[#8C522A] border border-[rgba(242,200,168,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C27D4E] animate-pulse" /> 5-Min Lock
            </span>
          </div>
          <span className="text-xs font-medium text-[#6B6560] block">Pending checkout</span>
          <p className="text-2xl sm:text-3xl font-bold text-[#13110F] mt-1 tabular-nums font-mono tracking-tight">
            {pendingPayments > 0 ? pendingPayments : 1}
          </p>
          <p className="text-[11px] text-[#8C847D] mt-1">5-min PayPal session active</p>
        </motion.div>

        {/* AI-Negotiated Savings */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle hover:shadow-card transition-all"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgba(180,199,166,0.25)] text-[#3E5C31] border border-[rgba(180,199,166,0.4)] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(180,199,166,0.25)] text-[#3E5C31] border border-[rgba(180,199,166,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4D6B3E]" /> 7.4% Savings
            </span>
          </div>
          <span className="text-xs font-medium text-[#6B6560] block">AI-negotiated savings</span>
          <p className="text-2xl sm:text-3xl font-bold text-[#3E5C31] mt-1 tabular-nums font-mono tracking-tight">
            {formatCurrency(aiIdentifiedSavings)}
          </p>
          <p className="text-[11px] text-[#8C847D] mt-1">7.4% under benchmark price ceilings</p>
        </motion.div>
      </div>

      {/* Autonomous Procurement & PayPal Settlement Journey */}
      <ProcurementWorkflowJourney currentActiveStage={6} interactive={true} />

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
            <div>
              <h3 className="text-xs font-semibold text-[#13110F]">Spending velocity & AI savings</h3>
              <p className="text-[11px] text-[#8C847D]">Monthly billing cycles</p>
            </div>
            <span className="text-[11px] font-mono text-[#13110F] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[rgba(19,17,15,0.08)]">
              6-Month Trend
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE6DC" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6560' }} axisLine={{ stroke: 'rgba(19,17,15,0.1)' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6560' }} tickFormatter={v => `₹${v / 1000}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#13110F',
                    color: '#FAF7F2',
                    borderRadius: '12px',
                    fontSize: '11px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }}
                />
                <Area type="monotone" dataKey="spend" name="Gross spend" stroke="#13110F" fill="#13110F" fillOpacity={0.06} strokeWidth={2} />
                <Area type="monotone" dataKey="aiSavings" name="AI savings" stroke="#3E5C31" fill="#B4C7A6" fillOpacity={0.25} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Allocation Progress Bar Stack */}
        <div className="p-5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3 mb-3">
              <h3 className="text-xs font-semibold text-[#13110F]">Budget allocation</h3>
              <span className="font-mono text-xs font-bold text-[#13110F]">{budgetUtilization}%</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-[#6B6560]">
                <span>Category distribution</span>
                <span className="font-mono text-[#13110F]">{formatCurrency(totalSpend > 0 ? totalSpend : 390110)}</span>
              </div>
              <div className="w-full bg-[#FAF7F2] rounded-full h-2.5 overflow-hidden flex border border-[rgba(19,17,15,0.08)]">
                <div style={{ width: '38%' }} className="bg-[#13110F]" title="Ergonomic Seating (38%)" />
                <div style={{ width: '28%' }} className="bg-[#8C522A]" title="Standing Desks (28%)" />
                <div style={{ width: '16%' }} className="bg-[#B4C7A6]" title="Storage (16%)" />
                <div style={{ width: '18%' }} className="bg-[#EDE6DC]" title="Displays & IT (18%)" />
              </div>
              <ul className="space-y-2 pt-2 text-xs">
                {categoryData.map((cat, i) => (
                  <li key={cat.name} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-[#6B6560]">
                      <span className={`w-2 h-2 rounded-full ${
                        i === 0 ? 'bg-[#13110F]' : i === 1 ? 'bg-[#8C522A]' : i === 2 ? 'bg-[#3E5C31]' : 'bg-[#8C847D]'
                      }`} />
                      {cat.name}
                    </span>
                    <span className="font-mono font-medium text-[#13110F]">{formatCurrency(cat.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-[rgba(19,17,15,0.08)] flex items-center justify-between">
            <span className="text-[11px] text-[#8C847D]">Annual ceiling</span>
            <span className="font-mono font-semibold text-xs text-[#13110F]">{formatCurrency(org.annual_procurement_budget)}</span>
          </div>
        </div>
      </div>

      {/* Active Purchase Orders Table */}
      <div className="p-0 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#13110F]" />
            <h3 className="text-xs font-semibold text-[#13110F]">Active purchase orders & fulfillment</h3>
          </div>
          <Link to="/orders" className="text-xs text-[#13110F] hover:text-[#6B6560] font-medium flex items-center gap-1">
            View all orders <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">PO Number</th>
                <th className="py-2.5 px-4 font-semibold">Vendor</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
              {purchaseOrders.slice(0, 5).map(po => (
                <tr key={po.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[#13110F]">
                    {po.po_number}
                  </td>
                  <td className="py-3 px-4 text-[#13110F]">
                    {po.supplier_name}
                  </td>
                  <td className="py-3 px-4 text-[#6B6560]">
                    {formatDate(po.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#13110F] tabular-nums">
                    {formatCurrency(po.total_amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      variant={
                        po.status === 'payment_completed' || po.status === 'delivered'
                          ? 'success'
                          : po.status === 'approved'
                          ? 'neutral'
                          : po.status === 'shipped'
                          ? 'info'
                          : 'warning'
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
                        <Button variant="primary" size="sm" className="rounded-xl shadow-sm">Pay</Button>
                      </Link>
                    ) : (
                      <Link to={`/orders?id=${po.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl">View</Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

