import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Truck,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { store } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState(store.getPurchaseOrders());
  const [suppliers, setSuppliers] = useState(store.getSuppliers());
  const [demandAlerts, setDemandAlerts] = useState(
    store.getDemandForecasts().filter(df => df.reorder_alert_triggered)
  );
  const org = store.getActiveOrganisation();

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setPurchaseOrders(store.getPurchaseOrders());
      setSuppliers(store.getSuppliers());
      setDemandAlerts(store.getDemandForecasts().filter(df => df.reorder_alert_triggered));
    });
    return unsub;
  }, []);

  // Compute Live KPIs
  const totalSpend = purchaseOrders
    .filter(po => po.status === 'payment_completed' || po.status === 'delivered')
    .reduce((sum, po) => sum + po.total_amount, 0);

  const pendingApprovals = purchaseOrders.filter(po => po.status === 'pending_approval').length;
  const pendingPayments = purchaseOrders.filter(po => po.status === 'approved' || po.status === 'payment_pending').length;
  const completedOrders = purchaseOrders.filter(po => po.status === 'payment_completed' || po.status === 'delivered').length;
  const aiIdentifiedSavings = 248500; // Total accumulated savings computed by AI optimizer
  const budgetUtilization = Math.round((totalSpend / org.annual_procurement_budget) * 100);

  // Spend by Month Chart Data
  const monthlySpendData = [
    { month: 'Oct', spend: 180000, aiSavings: 24000 },
    { month: 'Nov', spend: 320000, aiSavings: 45000 },
    { month: 'Dec', spend: 410000, aiSavings: 58000 },
    { month: 'Jan', spend: 290000, aiSavings: 38000 },
    { month: 'Feb', spend: 540000, aiSavings: 72000 },
    { month: 'Mar', spend: totalSpend > 0 ? totalSpend : 390110, aiSavings: aiIdentifiedSavings }
  ];

  // Category Spend Distribution
  const categoryData = [
    { name: 'Ergonomic Seating', value: 382500, color: '#2878E5' },
    { name: 'Standing Desks', value: 295000, color: '#28C5D7' },
    { name: 'Storage Cabinets', value: 168000, color: '#16A36A' },
    { name: 'Displays & IT', value: 472500, color: '#071426' },
    { name: 'AV & Peripherals', value: 89000, color: '#E9A23B' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-brand-blue rounded-2xl p-6 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-cyan/20 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-mono font-semibold border border-brand-cyan/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Autonomous AI Procurement
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> PayPal Orders API v2
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {store.getCurrentUser().full_name}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              ProcureAI is autonomously monitoring your corporate procurement lifecycle, validating supplier catalogues, and preparing PayPal checkout flows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/agent">
              <Button variant="primary" size="md" leftIcon={<Bot className="w-4 h-4" />}>
                Launch AI Procurement Agent
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Procurement Spend</p>
            <div className="p-2 rounded-lg bg-blue-50 text-brand-blue">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2">{formatCurrency(totalSpend)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Budget Utilized: {budgetUtilization}%</span>
            <span className="text-slate-400 ml-1">of ₹1.5 Cr</span>
          </div>
        </Card>

        {/* AI Identified Savings */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI-Identified Savings</p>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(aiIdentifiedSavings)}</p>
          <p className="text-xs text-slate-500 mt-2">
            Average <strong className="text-navy-900">7.8%</strong> price reduction via catalog matching
          </p>
        </Card>

        {/* Pending Approvals */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2">{pendingApprovals}</p>
          <div className="flex items-center gap-1 mt-2">
            {pendingApprovals > 0 ? (
              <Link to="/approvals" className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-0.5">
                Review pending queue <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-xs text-slate-500">All requests up to date</span>
            )}
          </div>
        </Card>

        {/* Active Suppliers & Verification */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Suppliers</p>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2">{suppliers.length}</p>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{suppliers.filter(s => s.verification_status === 'verified').length} Verified Partners</span>
          </p>
        </Card>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spend & AI Savings Area Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Procurement Spending & AI Savings Trends</h3>
              <p className="text-xs text-slate-500">Historical spending trajectory vs AI optimization benefit (INR)</p>
            </div>
            <Badge variant="info">Monthly Reconciliation</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#2878E5" stopOpacity={0.4} />
                    <stop offset="95%" stop-color="#2878E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#16A36A" stopOpacity={0.4} />
                    <stop offset="95%" stop-color="#16A36A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#071426', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="spend" name="Actual Spend" stroke="#2878E5" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
                <Area type="monotone" dataKey="aiSavings" name="AI Savings" stroke="#16A36A" strokeWidth={2} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-navy-900">Category Spending Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown across key office infrastructure</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{ backgroundColor: '#071426', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {categoryData.slice(0, 3).map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-semibold text-navy-900">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders & Demand Forecasting Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Orders Table */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Recent Purchase Orders</h3>
              <p className="text-xs text-slate-500">Live order lifecycle and PayPal status</p>
            </div>
            <Link to="/orders">
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                View All Orders
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">PO Number</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.slice(0, 4).map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-brand-blue">{po.po_number}</td>
                    <td className="py-3 px-3 font-medium text-navy-900">{po.supplier_name}</td>
                    <td className="py-3 px-3 font-semibold text-navy-900">{formatCurrency(po.total_amount)}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          po.status === 'payment_completed'
                            ? 'success'
                            : po.status === 'approved'
                            ? 'info'
                            : po.status === 'pending_approval'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {po.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(po.created_at)}</td>
                    <td className="py-3 px-3 text-right">
                      {po.status === 'approved' ? (
                        <Link to={`/payments?po=${po.id}`}>
                          <Button variant="paypal" size="sm">
                            Checkout
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/orders?id=${po.id}`}>
                          <Button variant="outline" size="sm">
                            View PO
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock & Demand Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Demand Reorder Alerts</h3>
              <p className="text-xs text-slate-500">Autonomous inventory forecasts</p>
            </div>
            <Link to="/forecasting">
              <Button variant="ghost" size="sm">
                Forecasts
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {demandAlerts.map(alert => (
              <div key={alert.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-navy-900">{alert.product_name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Stock: <span className="font-semibold text-rose-600">{alert.current_stock} left</span> (Est. stockout: {alert.estimated_stockout_date})
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Reorder: {alert.recommended_reorder_qty} units</span>
                  <Link to={`/agent?prompt=${encodeURIComponent(`Reorder ${alert.recommended_reorder_qty} units of ${alert.product_name}`)}`}>
                    <span className="text-brand-blue font-semibold hover:underline flex items-center gap-1">
                      Quick Order <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

