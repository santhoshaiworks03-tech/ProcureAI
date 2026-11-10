import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  Building,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Truck,
  ArrowRight,
  TrendingDown,
  X
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
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(['sup-01', 'sup-02']);

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
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">
            Supplier intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic scoring model across price competitiveness, delivery lead times, stock depth, and audit records
          </p>
        </div>
        <Badge variant="neutral">
          Evaluation matrix
        </Badge>
      </div>

      {/* Configurable Multi-Criteria Weights Panel */}
      <Card className="p-4 border-slate-200/80">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-semibold text-ink-950">
              Scoring parameter weights
            </h3>
          </div>
          <button
            onClick={() => setWeights({ ...DEFAULT_WEIGHTS })}
            className="text-[11px] text-[#13110F] font-semibold hover:underline"
          >
            Reset to standard (30 / 20 / 20 / 20 / 10)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          {/* Price Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">Price competitiveness</span>
              <span className="font-mono font-medium text-ink-950 tabular-nums">{Math.round(weights.priceWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={weights.priceWeight}
              onChange={e => setWeights({ ...weights, priceWeight: parseFloat(e.target.value) })}
              className="w-full accent-[#13110F] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Availability Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">Stock depth</span>
              <span className="font-mono font-medium text-ink-950 tabular-nums">{Math.round(weights.availabilityWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.availabilityWeight}
              onChange={e => setWeights({ ...weights, availabilityWeight: parseFloat(e.target.value) })}
              className="w-full accent-[#13110F] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Delivery Speed Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">Lead time</span>
              <span className="font-mono font-medium text-ink-950 tabular-nums">{Math.round(weights.deliveryWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.deliveryWeight}
              onChange={e => setWeights({ ...weights, deliveryWeight: parseFloat(e.target.value) })}
              className="w-full accent-[#13110F] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Reliability Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">SLA reliability</span>
              <span className="font-mono font-medium text-ink-950 tabular-nums">{Math.round(weights.reliabilityWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.reliabilityWeight}
              onChange={e => setWeights({ ...weights, reliabilityWeight: parseFloat(e.target.value) })}
              className="w-full accent-[#13110F] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Quality Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">Audit quality</span>
              <span className="font-mono font-medium text-ink-950 tabular-nums">{Math.round(weights.qualityWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={weights.qualityWeight}
              onChange={e => setWeights({ ...weights, qualityWeight: parseFloat(e.target.value) })}
              className="w-full accent-[#13110F] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search suppliers by name or category"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#13110F] focus:bg-white"
          />
        </div>
      </Card>

      {/* Scored Supplier Rankings Table */}
      <Card className="overflow-hidden p-0 border border-slate-200/80">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-ink-950">Dynamic commercial rankings</h3>
            <p className="text-[11px] text-slate-500">Recalculated from active parameter weights</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
            {filteredSuppliers.length} suppliers scored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3 font-medium w-8 text-center">Compare</th>
                <th className="py-2.5 px-3 font-medium w-12 text-center">Rank</th>
                <th className="py-2.5 px-3 font-medium">Supplier</th>
                <th className="py-2.5 px-3 font-medium text-center">Price</th>
                <th className="py-2.5 px-3 font-medium text-center">Stock</th>
                <th className="py-2.5 px-3 font-medium text-center">Lead time</th>
                <th className="py-2.5 px-3 font-medium text-center">Reliability</th>
                <th className="py-2.5 px-3 font-medium text-center">Quality</th>
                <th className="py-2.5 px-3.5 font-medium text-right">Composite</th>
                <th className="py-2.5 px-3.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((sup, idx) => {
                const isCompared = selectedForComparison.includes(sup.id);
                return (
                  <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => {
                          if (isCompared) {
                            setSelectedForComparison(prev => prev.filter(id => id !== sup.id));
                          } else {
                            if (selectedForComparison.length >= 3) {
                              setSelectedForComparison(prev => [...prev.slice(1), sup.id]);
                            } else {
                              setSelectedForComparison(prev => [...prev, sup.id]);
                            }
                          }
                        }}
                        className="rounded border-slate-300 text-[#13110F] accent-[#13110F] focus:ring-0 cursor-pointer"
                        title="Select for head-to-head comparison"
                      />
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-500 tabular-nums">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-ink-950 block">{sup.company_name}</span>
                      <span className="text-[11px] text-slate-500">{sup.business_category}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                      {sup.priceScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                      {sup.availabilityScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                      {sup.deliveryScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                      {sup.reliabilityScore}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                      {sup.qualityScore}%
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-ink-950 tabular-nums text-sm">
                      {sup.compositeScore}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/agent?prompt=${encodeURIComponent(`Find optimal catalogue items from ${sup.company_name}`)}`;
                        }}
                      >
                        Procure
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Head-to-Head Interactive Supplier Comparison Panel */}
      {selectedForComparison.length >= 2 && (
        <Card className="p-5 border-[rgba(19,17,15,0.12)] bg-[#FAF7F2] space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#13110F]" />
              <h3 className="text-xs font-bold text-[#13110F] uppercase tracking-wider">
                Multi-Supplier Head-to-Head Comparison Matrix
              </h3>
              <Badge variant="neutral" size="sm">
                {selectedForComparison.length} Vendors Selected
              </Badge>
            </div>
            <button
              onClick={() => setSelectedForComparison([])}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedForComparison.map(supId => {
              const sup = scoredSuppliers.find(s => s.id === supId);
              if (!sup) return null;

              // Find best in price, delivery, reliability
              const comparedSuppliers = scoredSuppliers.filter(s => selectedForComparison.includes(s.id));
              const isBestPrice = comparedSuppliers.every(s => s.priceScore <= sup.priceScore);
              const isFastest = comparedSuppliers.every(s => s.deliveryScore <= sup.deliveryScore);
              const isMostReliable = comparedSuppliers.every(s => s.reliabilityScore <= sup.reliabilityScore);

              return (
                <div key={sup.id} className="p-4 rounded-xl border border-[rgba(19,17,15,0.08)] bg-white shadow-sm space-y-3 relative overflow-hidden">
                  {/* Highlight Badges */}
                  <div className="flex flex-wrap gap-1.5 min-h-[22px]">
                    {isBestPrice && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#B4C7A6]/30 text-[#3E5C31] border border-[#B4C7A6]">
                        <TrendingDown className="w-3 h-3" /> Best Value
                      </span>
                    )}
                    {isFastest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDE6DC] text-[#13110F] border border-[rgba(19,17,15,0.1)]">
                        <Truck className="w-3 h-3" /> Fastest Delivery
                      </span>
                    )}
                    {isMostReliable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2C8A8]/30 text-[#13110F] border border-[#F2C8A8]">
                        <ShieldCheck className="w-3 h-3" /> Highest SLA
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sup.company_name}</h4>
                    <p className="text-[11px] text-slate-500">{sup.business_category} • {sup.address.city}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Composite score:</span>
                      <span className="font-bold text-[#13110F]">{sup.compositeScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Avg lead time:</span>
                      <span className="text-slate-800">{sup.avgLeadTime} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">SLA reliability:</span>
                      <span className="text-emerald-700 font-semibold">{sup.reliability_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Catalogue inventory:</span>
                      <span className="text-slate-800">{sup.totalStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Payment pipeline:</span>
                      <span className="text-slate-800">PayPal Orders v2</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      window.location.href = `/agent?prompt=${encodeURIComponent(`Prepare order quotation strictly from ${sup.company_name}`)}`;
                    }}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Select {sup.company_name.split(' ')[0]}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
