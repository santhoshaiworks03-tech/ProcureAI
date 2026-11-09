import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Mail,
  Search,
  Building,
  CheckCircle2,
  ExternalLink
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
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">Suppliers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audited commercial vendors with verified PayPal merchant settlement accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral">
            <span className="tabular-nums font-mono font-medium">{suppliers.length}</span> active vendors
          </Badge>
        </div>
      </div>

      {/* Search Input */}
      <Card className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search suppliers by name, category, or city"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          />
        </div>
      </Card>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(supplier => (
          <Card
            key={supplier.id}
            className="flex flex-col justify-between border border-slate-200/80 p-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink-950">
                    {supplier.company_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{supplier.business_category}</p>
                </div>
                {supplier.is_provisional ? (
                  <Badge variant="warning" dot size="sm">Provisional</Badge>
                ) : (
                  <Badge variant="success" dot size="sm">Verified</Badge>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/70 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Reliability</span>
                  <span className="font-semibold text-ink-950 font-mono tabular-nums">{supplier.reliability_score}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Rating</span>
                  <span className="font-semibold text-ink-950 font-mono tabular-nums">
                    {supplier.delivery_rating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Quality</span>
                  <span className="font-semibold text-ink-950 font-mono tabular-nums">{supplier.quality_score}%</span>
                </div>
              </div>

              {/* Address and Contact info */}
              <div className="space-y-1 text-xs text-slate-500 pt-0.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{supplier.address.city}, {supplier.address.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate font-mono text-[11px] text-slate-600">{supplier.contact_email}</span>
                </div>
              </div>
            </div>

            {/* Footer with PayPal Settlement badge and Details button */}
            <div className="pt-3 mt-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                PayPal ready
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSupplier(supplier)}
              >
                Profile
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
          subtitle={`Legal entity: ${selectedSupplier.legal_name} · GSTIN: ${selectedSupplier.gstin_tax_id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200/70 text-center">
              <div>
                <span className="text-slate-400 text-[10px] block">Reliability</span>
                <span className="text-sm font-semibold text-ink-950 font-mono tabular-nums">{selectedSupplier.reliability_score}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Delivery rating</span>
                <span className="text-sm font-semibold text-ink-950 font-mono tabular-nums">{selectedSupplier.delivery_rating} / 5.0</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Quality audit</span>
                <span className="text-sm font-semibold text-ink-950 font-mono tabular-nums">{selectedSupplier.quality_score}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Audit status</span>
                <span className="text-sm font-semibold text-ink-950 capitalize">{selectedSupplier.verification_status}</span>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50/60 rounded-lg border border-slate-200/70">
              <h4 className="font-semibold text-ink-950 text-xs">Contract and settlement records</h4>
              <p className="text-slate-600"><strong>Address:</strong> {selectedSupplier.address.street}, {selectedSupplier.address.city}, {selectedSupplier.address.state} {selectedSupplier.address.postal_code}</p>
              <p className="text-slate-600"><strong>Payment terms:</strong> {selectedSupplier.payment_terms}</p>
              <p className="text-slate-600"><strong>PayPal merchant ID:</strong> <span className="font-mono text-slate-800">{selectedSupplier.paypal_merchant_id || 'PPL-MERCH-DEFAULT'}</span></p>
              <p className="text-slate-600"><strong>Settlement email:</strong> <span className="font-mono text-slate-800">{selectedSupplier.paypal_email || selectedSupplier.contact_email}</span></p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSupplier(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedSupplier(null);
                  window.location.href = `/agent?prompt=${encodeURIComponent(`Find catalogue items from ${selectedSupplier.company_name}`)}`;
                }}
              >
                Procure from supplier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
