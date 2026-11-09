import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  Star,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Search,
  Building,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { store } from '../../lib/store';
import { Supplier } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState(store.getSuppliers());
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(
    s =>
      s.company_name.toLowerCase().includes(search.toLowerCase()) ||
      s.business_category.toLowerCase().includes(search.toLowerCase()) ||
      s.address.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Verified Supplier Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audited B2B suppliers integrated with PayPal Merchant accounts and automated SLA scoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">{suppliers.length} Registered Suppliers</Badge>
        </div>
      </div>

      {/* Search Input */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, category, or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:bg-white"
          />
        </div>
      </Card>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(supplier => (
          <Card
            key={supplier.id}
            hoverEffect
            className="flex flex-col justify-between border border-slate-200/90 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-navy-900 group-hover:text-brand-blue transition-colors">
                    {supplier.company_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{supplier.business_category}</p>
                </div>
                {supplier.is_provisional ? (
                  <Badge variant="provisional">Provisional</Badge>
                ) : (
                  <Badge variant="success">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </Badge>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Reliability</span>
                  <span className="font-bold text-navy-900 font-mono">{supplier.reliability_score}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Delivery</span>
                  <span className="font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> {supplier.delivery_rating}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Quality</span>
                  <span className="font-bold text-navy-900 font-mono">{supplier.quality_score}%</span>
                </div>
              </div>

              {/* Address and Contact info */}
              <div className="space-y-1 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{supplier.address.city}, {supplier.address.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{supplier.contact_email}</span>
                </div>
              </div>
            </div>

            {/* Footer with PayPal Settlement badge and Details button */}
            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> PayPal Express Ready
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSupplier(supplier)}
              >
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Supplier Profile Modal */}
      {selectedSupplier && (
        <Modal
          isOpen={Boolean(selectedSupplier)}
          onClose={() => setSelectedSupplier(null)}
          title={selectedSupplier.company_name}
          subtitle={`Legal: ${selectedSupplier.legal_name} | GSTIN: ${selectedSupplier.gstin_tax_id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <div>
                <span className="text-slate-400 text-[10px] block">Reliability Score</span>
                <span className="text-base font-bold text-navy-900">{selectedSupplier.reliability_score}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Delivery Rating</span>
                <span className="text-base font-bold text-emerald-600">{selectedSupplier.delivery_rating} / 5.0</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Quality Audit</span>
                <span className="text-base font-bold text-navy-900">{selectedSupplier.quality_score}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Status</span>
                <span className="text-base font-bold text-emerald-600 capitalize">{selectedSupplier.verification_status}</span>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <h4 className="font-bold text-navy-900 text-xs">Corporate & Banking Details</h4>
              <p className="text-slate-600"><strong>Address:</strong> {selectedSupplier.address.street}, {selectedSupplier.address.city}, {selectedSupplier.address.state} - {selectedSupplier.address.postal_code}</p>
              <p className="text-slate-600"><strong>Payment Terms:</strong> {selectedSupplier.payment_terms}</p>
              <p className="text-slate-600"><strong>PayPal Merchant ID:</strong> <span className="font-mono text-brand-blue">{selectedSupplier.paypal_merchant_id || 'PPL-MERCH-DEFAULT'}</span></p>
              <p className="text-slate-600"><strong>PayPal Settlement Email:</strong> {selectedSupplier.paypal_email || selectedSupplier.contact_email}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedSupplier(null);
                  window.location.href = `/agent?prompt=${encodeURIComponent(`Find catalogue items from ${selectedSupplier.company_name}`)}`;
                }}
              >
                Create Procurement Request
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

