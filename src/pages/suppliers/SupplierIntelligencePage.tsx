import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  Search,
  Filter,
  TrendingUp,
  Award,
  Zap,
  Info,
  Building
} from 'lucide-react';
import { store } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import { DEFAULT_WEIGHTS, ScoringWeights } from '../../services/ai/aiService';

export const SupplierIntelligencePage: React.FC = () => {
  const [weights, setWeights] = useState<ScoringWeights>({ ...DEFAULT_WEIGHTS });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const suppliers = store.getSuppliers();
  const listings = store.getSupplierProducts();

  // Dynamic Multi-Criteria Evaluation Calculator
  const scoredSuppliers = useMemo(() => {
    return suppliers.map(sup => {
      const supListings = listings.filter(l => l.supplier_id === sup.id);
      const totalStock = supListings.reduce((sum, l) => sum + l.available_stock, 0);
      const avgLeadTime = supListings.length > 0 ? supListings.reduce((sum, l) => sum + l.estimated_delivery_days, 0) / supListings.length : 4;
      const avgPrice = supListings.length > 0 ? supListings.reduce((sum, l) => sum + l.unit_price, 0) / supListings.length : 5000;

      // Price score (Lower average price = higher competitiveness)
      const priceScore = Math.max(20, Math.min(100, Math.round(100 - (avgPrice / 6000 - 0.7) * 50)));
      // Availability score
      const availabilityScore = Math.max(30, Math.min(100, Math.round((totalStock / 250) * 100)));
      // Delivery speed score
      const deliveryScore = Math.max(30, Math.min(100, Math.round(100 - avgLeadTime * 9)));
      // Reliability score
      const reliabilityScore = sup.reliability_score || 85;
      // Quality score
      const qualityScore = sup.quality_score || 90;

      const composite = Math.round(
        priceScore * weights.priceWeight +
        availabilityScore * weights.availabilityWeight +
        deliveryScore * weights.deliveryWeight +
        reliabilityScore * weights.reliabilityWeight +
        qualityScore * weights.qualityWeight
      );

      return {
        ...sup,
        listingsCount: supListings.length,
        totalStock,
        avgLeadTime: Math.round(avgLeadTime * 10) / 10,
        priceScore,
        availabilityScore,
        deliveryScore,
        reliabilityScore,
        qualityScore,
        compositeScore: composite
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }, [suppliers, listings, weights]);

  const filteredSuppliers = scoredSuppliers.filter(s =>
    s.company_name.toLowerCase().includes(search.toLowerCase()) ||
    s.business_category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Supplier Intelligence & Ranking Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tune algorithmic evaluation weights to rank commercial partners across price, speed, inventory depth, and fulfillment reliability.
          </p>
        </div>
        <Badge variant="info">
          <Zap className="w-3.5 h-3.5 text-brand-blue" /> Live Mathematical Recalculation
        </Badge>
      </div>

      {/* Configurable Multi-Criteria Weights Panel */}
      <Card className="border-brand-blue/30 bg-gradient-to-r from-white via-slate-50/50 to-blue-50/20">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Scoring Model Parameter Weights
            </h3>
          </div>
          <button
            onClick={() => setWeights({ ...DEFAULT_WEIGHTS })}
            className="text-[11px] text-brand-blue font-semibold hover:underline"
          >
            Reset to Standard 30/20/20/20/10
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          {/* Price Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Price Competitiveness</span>
              <span className="font-mono font-bold text-brand-blue">{Math.round(weights.priceWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={weights.priceWeight}
              onChange={e => setWeights({ ...weights, priceWeight: parseFloat(e.target.value) })}
              className="w-full accent-brand-blue cursor-pointer"
            />
          </div>

          {/* Availability Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Stock Availability</span>
              <span className="font-mono font-bold text-brand-blue">{Math.round(weights.availabilityWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.availabilityWeight}
              onChange={e => setWeights({ ...weights, availabilityWeight: parseFloat(e.target.value) })}
              className="w-full accent-brand-blue cursor-pointer"
            />
          </div>

          {/* Delivery Speed Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Delivery Lead Time</span>
              <span className="font-mono font-bold text-brand-blue">{Math.round(weights.deliveryWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.deliveryWeight}
              onChange={e => setWeights({ ...weights, deliveryWeight: parseFloat(e.target.value) })}
              className="w-full accent-brand-blue cursor-pointer"
            />
          </div>

          {/* Reliability Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Historical Reliability</span>
              <span className="font-mono font-bold text-brand-blue">{Math.round(weights.reliabilityWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.reliabilityWeight}
              onChange={e => setWeights({ ...weights, reliabilityWeight: parseFloat(e.target.value) })}
              className="w-full accent-brand-blue cursor-pointer"
            />
          </div>

          {/* Quality Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">ESG & Quality Audit</span>
              <span className="font-mono font-bold text-brand-blue">{Math.round(weights.qualityWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={weights.qualityWeight}
              onChange={e => setWeights({ ...weights, qualityWeight: parseFloat(e.target.value) })}
              className="w-full accent-brand-blue cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Comparison & Ranking Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search evaluated suppliers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:bg-white"
            />
          </div>

          <span className="text-xs text-slate-500">
            Showing <strong className="text-navy-900">{filteredSuppliers.length}</strong> ranked suppliers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank & Supplier</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Price Score</th>
                <th className="py-3 px-3 text-center">Availability</th>
                <th className="py-3 px-3 text-center">Avg Lead Time</th>
                <th className="py-3 px-3 text-center">Reliability</th>
                <th className="py-3 px-3 text-center">Quality</th>
                <th className="py-3 px-4 text-center">Composite Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((sup, idx) => (
                <tr
                  key={sup.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    idx === 0 ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0
                            ? 'bg-brand-blue text-white shadow-xs'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-navy-900 block">{sup.company_name}</span>
                        <span className="text-[10px] text-slate-400">Total Stock: {sup.totalStock} units</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{sup.business_category}</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold">{sup.priceScore}%</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold">{sup.availabilityScore}%</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold">{sup.avgLeadTime} days</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold">{sup.reliabilityScore}%</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold">{sup.qualityScore}%</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        idx === 0
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-navy-900'
                      }`}
                    >
                      {sup.compositeScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/agent?prompt=${encodeURIComponent(`Procure required office products from ${sup.company_name}`)}`;
                      }}
                    >
                      Select
                    </Button>
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
