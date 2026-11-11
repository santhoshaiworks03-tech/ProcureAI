import React, { useState } from 'react';
import {
  Download,
  Calendar,
  Building
} from 'lucide-react';
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
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, getCurrencySymbol } from '../../lib/utils';

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('90d');
  const org = store.getActiveOrganisation();

  // Spend by Supplier
  const supplierSpendData = [
    { name: 'OmniOffice Direct', spend: 390110, count: 2 },
    { name: 'CloudNine Tech', spend: 472500, count: 1 },
    { name: 'Ergotech Furnishings', spend: 210000, count: 2 },
    { name: 'Horizon Office Ware', spend: 145000, count: 1 },
    { name: 'Vertex Global Supplies', spend: 95200, count: 1 }
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
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">
            Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Spend aggregation, budget velocity, and autonomous negotiation savings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            {['30d', '90d', '1y'].map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  dateRange === r ? 'bg-white text-ink-950 shadow-xs' : 'text-slate-600 hover:text-ink-950'
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
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200/80">
          <span className="text-xs text-slate-500 block">Annual budget allocation</span>
          <p className="text-xl font-semibold text-ink-950 mt-1 tabular-nums font-mono">{formatCurrency(org.annual_procurement_budget)}</p>
          <p className="text-[11px] text-slate-500 mt-1">FY 2024-25 strategic infrastructure</p>
        </Card>
        <Card className="p-4 border-slate-200/80">
          <span className="text-xs text-slate-500 block">Settled via PayPal</span>
          <p className="text-xl font-semibold text-ink-950 mt-1 tabular-nums font-mono">{formatCurrency(org.spent_budget || 4250000)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Verified merchant capture
          </p>
        </Card>
        <Card className="p-4 border-slate-200/80">
          <span className="text-xs text-slate-500 block">Identified savings</span>
          <p className="text-xl font-semibold text-emerald-600 mt-1 tabular-nums font-mono">{formatCurrency(275200)}</p>
          <p className="text-[11px] text-slate-500 mt-1">7.4% under benchmark price ceilings</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trends Area Chart */}
        <Card className="p-4 border-slate-200/80">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-ink-950">Procurement spend vs AI savings</h3>
            <p className="text-[11px] text-slate-500">Historical trend across monthly billing cycles</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `${getCurrencySymbol()}${v / 1000}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#07090E',
                    color: '#F8FAFC',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="spend" name="Spend" stroke="#13110F" fill="#13110F" fillOpacity={0.08} strokeWidth={2} />
                <Area type="monotone" dataKey="savings" name="AI savings" stroke="#3E5C31" fill="#B4C7A6" fillOpacity={0.25} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Spend by Supplier Bar Chart */}
        <Card className="p-4 border-slate-200/80">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-ink-950">Spend by commercial supplier</h3>
            <p className="text-[11px] text-slate-500">Allocation across registered vendor partners</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierSpendData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `${getCurrencySymbol()}${v / 1000}k`} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={130} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Spend']}
                  contentStyle={{
                    backgroundColor: '#13110F',
                    color: '#FAF7F2',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <Bar dataKey="spend" name="Total spend" fill="#13110F" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
