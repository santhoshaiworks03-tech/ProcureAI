import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Package,
  Calendar,
  Sparkles,
  BarChart2,
  Clock,
  ShieldAlert
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
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Predictive Demand & Inventory Forecasting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Machine-learning consumption velocity analysis, stockout date projections, and autonomous reorder suggestions.
          </p>
        </div>
        <Badge variant="info">
          <Sparkles className="w-3 h-3 text-brand-blue" /> Linear Consumption Models
        </Badge>
      </div>

      {/* Reorder Alerts Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forecasts.filter(f => f.reorder_alert_triggered).map(alert => (
          <Card key={alert.id} className="border-amber-300 bg-amber-50/40 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">{alert.product_name}</h4>
                  <p className="text-[11px] text-slate-500">{alert.category}</p>
                </div>
              </div>
              <Badge variant="danger" size="sm">Urgent Stockout</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-amber-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Current Stock</span>
                <span className="font-bold text-rose-600">{alert.current_stock} Units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Est. Stockout Date</span>
                <span className="font-bold text-navy-900">{alert.estimated_stockout_date}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                Recommended: <strong className="text-navy-900">{alert.recommended_reorder_qty} units</strong>
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
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Current Stock vs 30-Day Projected Demand</h3>
            <p className="text-xs text-slate-500">Visual comparison identifying inventory deficits and optimal reorder levels</p>
          </div>
          <Badge variant="default">30-Day Horizon</Badge>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#071426', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="currentStock" name="Current Stock" fill="#28C5D7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="forecasted30d" name="30-Day Demand" fill="#071426" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recommendedReorder" name="Recommended Reorder" fill="#2878E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Forecasting Data Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-navy-900">Inventory Velocity & Reorder Recommendations</h3>
          <p className="text-xs text-slate-500">Confidence levels and daily consumption burn rate per SKU</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Current Stock</th>
                <th className="py-3 px-3 text-center">Daily Burn Rate</th>
                <th className="py-3 px-3 text-center">30-Day Forecast</th>
                <th className="py-3 px-3 text-center">Est. Stockout</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-4 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecasts.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-900">{f.product_name}</td>
                  <td className="py-3 px-3 text-slate-600">{f.category}</td>
                  <td className="py-3 px-3 text-center font-bold text-navy-900">{f.current_stock}</td>
                  <td className="py-3 px-3 text-center font-mono">{f.burn_rate_daily} / day</td>
                  <td className="py-3 px-3 text-center font-bold text-brand-blue">{f.forecasted_demand_30d}</td>
                  <td className="py-3 px-3 text-center font-medium text-rose-600">{f.estimated_stockout_date}</td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={f.confidence_level === 'high' ? 'success' : 'default'} size="sm">
                      {f.confidence_level.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/agent?prompt=${encodeURIComponent(`I need to reorder ${f.recommended_reorder_qty} units of ${f.product_name}`)}`}>
                      <Button variant="outline" size="sm">
                        Create PO
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

