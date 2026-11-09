import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CreditCard,
  Clock,
  Truck,
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

  const totalSpend = purchaseOrders
    .filter(po => po.status === 'payment_completed' || po.status === 'delivered')
    .reduce((sum, po) => sum + po.total_amount, 0);

  const pendingApprovals = purchaseOrders.filter(po => po.status === 'pending_approval').length;
  const pendingPayments = purchaseOrders.filter(po => po.status === 'approved' || po.status === 'payment_pending').length;
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
    { name: 'Ergonomic Seating', value: 382500, color: '#1D4ED8' },
    { name: 'Standing Desks', value: 295000, color: '#0EA5E9' },
    { name: 'Storage Cabinets', value: 168000, color: '#10B981' },
    { name: 'Displays & IT', value: 472500, color: '#334155' },
    { name: 'AV & Peripherals', value: 89000, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header (No greeting, quiet context) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Procurement Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Q1 2026 • {org.name} • INR (₹)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/agent">
            <Button variant="primary" size="sm" leftIcon={<Bot className="w-3.5 h-3.5" />}>
              New procurement request
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards Row: Numbers only, no filler icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <span className="text-xs font-medium text-slate-500 block">Total spend</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">{formatCurrency(totalSpend)}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {budgetUtilization}% of annual budget
          </span>
        </Card>

        <Card>
          <span className="text-xs font-medium text-slate-500 block">Identified savings</span>
          <p className="text-2xl font-semibold text-emerald-700 mt-1 tabular-nums">{formatCurrency(aiIdentifiedSavings)}</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            +7.8% vs benchmark catalog rates
          </span>
        </Card>

        <Card>
          <span className="text-xs font-medium text-slate-500 block">Pending approvals</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">{pendingApprovals}</p>
          <div className="mt-1">
            {pendingApprovals > 0 ? (
              <Link to="/approvals" className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-medium">
                Review queue <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-[11px] text-slate-400">All orders approved</span>
            )}
          </div>
        </Card>

        <Card>
          <span className="text-xs font-medium text-slate-500 block">Verified suppliers</span>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">{suppliers.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {suppliers.filter(s => s.verification_status === 'verified').length} verified commercial partners
          </span>
        </Card>
      </div>

      {/* Main Charts Grid: Single Accent, Quiet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Spending and savings trajectory</h2>
              <p className="text-xs text-slate-500">Monthly actual spend vs AI price optimization (INR)</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Monthly</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="spend" name="Actual Spend" stroke="#1D4ED8" strokeWidth={1.5} fill="#1D4ED8" fillOpacity={0.08} />
                <Area type="monotone" dataKey="aiSavings" name="AI Savings" stroke="#10B981" strokeWidth={1.5} fill="#10B981" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Share List */}
        <Card>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Category allocation</h2>
            <p className="text-xs text-slate-500">Spend distribution across departments</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {categoryData.slice(0, 3).map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Orders and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Orders Table */}
        <Card className="lg:col-span-2 overflow-hidden p-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent purchase orders</h2>
              <p className="text-xs text-slate-500">Latest active orders and settlement status</p>
            </div>
            <Link to="/orders" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] bg-slate-50/70 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-medium">PO number</th>
                  <th className="py-2.5 px-3 font-medium">Supplier</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.slice(0, 4).map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{po.po_number}</td>
                    <td className="py-2.5 px-3 text-slate-700">{po.supplier_name}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900 tabular-nums">{formatCurrency(po.total_amount)}</td>
                    <td className="py-2.5 px-3">
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
                        dot
                      >
                        {po.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{formatDate(po.created_at)}</td>
                    <td className="py-2.5 px-4 text-right">
                      {po.status === 'approved' ? (
                        <Link to={`/payments?po=${po.id}`}>
                          <Button variant="paypal" size="sm">
                            Checkout
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/orders?id=${po.id}`}>
                          <Button variant="outline" size="sm">
                            View
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

        {/* Low Stock Reorder Notifications */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Reorder alerts</h2>
              <p className="text-xs text-slate-500">Stock projections</p>
            </div>
            <Link to="/forecasting" className="text-xs text-blue-600 hover:underline font-medium">
              Forecasts
            </Link>
          </div>

          <div className="space-y-2.5">
            {demandAlerts.map(alert => (
              <div key={alert.id} className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-900">{alert.product_name}</span>
                  <span className="text-[11px] font-mono text-rose-600 font-medium">{alert.current_stock} left</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Reorder: {alert.recommended_reorder_qty} units</span>
                  <Link
                    to={`/agent?prompt=${encodeURIComponent(`Reorder ${alert.recommended_reorder_qty} units of ${alert.product_name}`)}`}
                    className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5"
                  >
                    Order <ArrowRight className="w-3 h-3" />
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
