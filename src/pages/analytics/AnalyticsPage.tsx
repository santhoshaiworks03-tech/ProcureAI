import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  PieChart as PieIcon,
  Sparkles,
  CreditCard,
  Building,
  CheckCircle2
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
import { formatCurrency } from '../../lib/utils';

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('90d');
  const org = store.getActiveOrganisation();
  const purchaseOrders = store.getPurchaseOrders();

  // Spend by Supplier
  const supplierSpendData = [
    { name: 'OmniOffice Direct', spend: 390110, count: 2 },
    { name: 'CloudNine Tech', spend: 472500, count: 1 },
    { name: 'Ergotech Furnishings', spend: 210000, count: 2 },
    { name: 'Horizon Office Ware', spend: 145000, count: 1 },
    { name: 'Vertex Global Supplies', spend: 95200, count: 1 }
  ];

  // Category Spend
  const categoryData = [
    { name: 'Ergonomic Seating', value: 382500, color: '#2878E5' },
    { name: 'Standing Desks', value: 295000, color: '#28C5D7' },
    { name: 'Enterprise Computing', value: 472500, color: '#071426' },
    { name: 'Storage & Cabinets', value: 168000, color: '#16A36A' },
    { name: 'AV & Conference', value: 89000, color: '#E9A23B' }
  ];

  // Monthly Velocity
  const monthlyData = [
    { month: 'Oct 2024', spend: 180000, savings: 24000 },
    { month: 'Nov 2024', spend: 320000, savings: 45000 },
    { month: 'Dec 2024', spend: 410000, savings: 58000 },
    { month: 'Jan 2025', spend: 290000, savings: 38000 },
    { month: 'Feb 2025', spend: 540000, savings: 72000 },
    { month: 'Mar 2025', spend: 390110, savings: 38200 }
  ];

  const exportAnalyticsCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Month,Actual Spend (INR),AI Identified Savings (INR)\n' +
      monthlyData.map(d => `${d.month},${d.spend},${d.savings}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `procureai-spend-analytics-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Procurement Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time spend aggregation, budget consumption velocity, and AI cost-reduction analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range filter */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
            {['30d', '90d', '1y'].map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all uppercase ${
                  dateRange === r ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAnalyticsCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Annual Budget Allocation</span>
          <p className="text-2xl font-bold text-navy-900 mt-1">{formatCurrency(org.annual_procurement_budget)}</p>
          <p className="text-xs text-slate-500 mt-1">FY 2024-25 Strategic Infrastructure Budget</p>
        </Card>
        <Card>
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Total Settled via PayPal</span>
          <p className="text-2xl font-bold text-brand-blue mt-1">{formatCurrency(org.spent_budget || 4250000)}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified Merchant Settlement
          </p>
        </Card>
        <Card>
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Total AI-Identified Savings</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(275200)}</p>
          <p className="text-xs text-slate-500 mt-1">7.4% under benchmark price ceilings</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Area Chart */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-navy-900">Procurement Spend vs AI Savings</h3>
            <p className="text-xs text-slate-500">Historical trend across monthly billing cycles</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#071426', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="spend" name="Spend" stroke="#2878E5" fill="#2878E5" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="savings" name="AI Savings" stroke="#16A36A" fill="#16A36A" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Spend by Supplier Bar Chart */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-navy-900">Spend by Commercial Supplier</h3>
            <p className="text-xs text-slate-500">Allocation across registered vendor partners</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierSpendData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{ backgroundColor: '#071426', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="spend" name="Total Spend" fill="#071426" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

