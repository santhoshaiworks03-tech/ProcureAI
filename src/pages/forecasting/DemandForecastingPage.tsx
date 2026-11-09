import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Package,
  Calendar
} from 'lucide-react';
import {
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

export const DemandForecastingPage: React.FC = () => {
  const forecasts = store.getDemandForecasts();

  const chartData = forecasts.map(f => ({
    name: f.product_name.split(' ')[0] + ' ' + (f.product_name.split(' ')[1] || ''),
    currentStock: f.current_stock,
    forecasted30d: f.forecasted_demand_30d,
    recommendedReorder: f.recommended_reorder_qty
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">
            Demand forecasting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consumption velocity, stockout horizon projections, and suggested reorder quantities
          </p>
        </div>
        <Badge variant="neutral">
          30-day forecast horizon
        </Badge>
      </div>

      {/* Reorder Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forecasts.filter(f => f.reorder_alert_triggered).map(alert => (
          <Card key={alert.id} className="border-amber-200/90 bg-amber-50/20 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-ink-950">{alert.product_name}</h4>
                  <p className="text-[11px] text-slate-500">{alert.category}</p>
                </div>
              </div>
              <Badge variant="warning" dot size="sm">Stockout risk</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-amber-200/50 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Current stock</span>
                <span className="font-semibold text-rose-600 font-mono tabular-nums">{alert.current_stock} units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Est. stockout</span>
                <span className="font-medium text-ink-950 font-mono tabular-nums">{alert.estimated_stockout_date}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                Suggested: <strong className="text-ink-950 font-mono tabular-nums">{alert.recommended_reorder_qty} units</strong>
              </span>
              <Link to={`/agent?prompt=${encodeURIComponent(`I need to reorder ${alert.recommended_reorder_qty} units of ${alert.product_name}`)}`}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                  Reorder
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Visual Forecasting Comparison Bar Chart */}
      <Card className="p-4 border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-ink-950">Stock depth against 30-day projected demand</h3>
            <p className="text-[11px] text-slate-500">Deficit analysis identifying inventory replenishment requirements</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#07090E',
                  color: '#F8FAFC',
                  borderRadius: '6px',
                  fontSize: '11px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="currentStock" name="Current stock" fill="#94A3B8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="forecasted30d" name="30-day demand" fill="#0F172A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="recommendedReorder" name="Recommended reorder" fill="#1D4ED8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Forecasting Data Table */}
      <Card className="overflow-hidden p-0 border border-slate-200/80">
        <div className="p-3.5 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-ink-950">Inventory burn rate and model confidence</h3>
          <p className="text-[11px] text-slate-500">Consumption velocity calculations per SKU</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3.5 font-medium">Product</th>
                <th className="py-2.5 px-3 font-medium">Category</th>
                <th className="py-2.5 px-3 font-medium text-center">Stock</th>
                <th className="py-2.5 px-3 font-medium text-center">Daily burn</th>
                <th className="py-2.5 px-3 font-medium text-center">30d demand</th>
                <th className="py-2.5 px-3 font-medium text-center">Est. stockout</th>
                <th className="py-2.5 px-3 font-medium text-center">Confidence</th>
                <th className="py-2.5 px-3.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecasts.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3.5">
                    <span className="font-medium text-ink-950 block">{f.product_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">SKU: {f.product_id}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{f.category}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium text-ink-950 tabular-nums">
                    {f.current_stock}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 tabular-nums">
                    {f.burn_rate_daily} / day
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-ink-950 tabular-nums">
                    {f.forecasted_demand_30d}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 tabular-nums">
                    {f.estimated_stockout_date}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant="neutral" size="sm">
                      <span className="capitalize">{f.confidence_level.replace('_', ' ')}</span>
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <Link to={`/agent?prompt=${encodeURIComponent(`I need to reorder ${f.recommended_reorder_qty} units of ${f.product_name}`)}`}>
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
