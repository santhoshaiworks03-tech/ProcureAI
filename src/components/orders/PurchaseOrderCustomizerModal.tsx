import React, { useState, useEffect, useMemo } from 'react';
import {
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  Building,
  Truck,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { store } from '../../lib/store';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Product } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';

export interface PurchaseOrderCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: PurchaseOrder | null;
  onSave?: (savedOrder: PurchaseOrder) => void;
  mode?: 'edit' | 'create';
  initialSupplierId?: string;
}

export const PurchaseOrderCustomizerModal: React.FC<PurchaseOrderCustomizerModalProps> = ({
  isOpen,
  onClose,
  order,
  onSave,
  mode = 'edit',
  initialSupplierId
}) => {
  const suppliers = useMemo(() => store.getSuppliers(), []);
  const allProducts = useMemo(() => store.getProducts(), []);
  const currentUser = useMemo(() => store.getCurrentUser(), []);
  const org = useMemo(() => store.getActiveOrganisation(), []);

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    order?.supplier_id || initialSupplierId || suppliers[0]?.id || 'sup-01'
  );
  const [items, setItems] = useState<PurchaseOrderItem[]>(
    order?.items?.map(i => ({ ...i })) || [
      {
        id: `poi-${Date.now()}-1`,
        purchase_order_id: order?.id || '',
        product_id: allProducts[0]?.id || 'prod-01',
        product_name: allProducts[0]?.name || 'Commercial Office Chair',
        quantity: 10,
        unit_price: allProducts[0]?.benchmark_market_price || 8500,
        total_amount: 10 * (allProducts[0]?.benchmark_market_price || 8500)
      }
    ]
  );

  const [deliveryAddress, setDeliveryAddress] = useState({
    recipient_name: order?.delivery_address?.recipient_name || org.name || 'Apex Tech Solutions',
    street: order?.delivery_address?.street || 'Cyber City, Phase 2, Tower B',
    city: order?.delivery_address?.city || 'Bengaluru',
    state: order?.delivery_address?.state || 'Karnataka',
    postal_code: order?.delivery_address?.postal_code || '560100',
    country: order?.delivery_address?.country || 'India'
  });

  const [expectedDate, setExpectedDate] = useState<string>(
    order?.expected_delivery_date
      ? order.expected_delivery_date.split('T')[0]
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [terms, setTerms] = useState<string>(
    order?.terms_and_conditions ||
      'Net 30 days upon inspection. 100% replacement warranty against transit damage. Delivery SLA compliance mandatory.'
  );

  const [shippingCost, setShippingCost] = useState<number>(order?.shipping_amount || 2500);
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestionMessage, setAiSuggestionMessage] = useState<string | null>(null);

  // Sync state whenever `order` changes
  useEffect(() => {
    if (order) {
      setSelectedSupplierId(order.supplier_id);
      setItems(order.items.map(i => ({ ...i })));
      if (order.delivery_address) {
        setDeliveryAddress({ ...order.delivery_address });
      }
      if (order.expected_delivery_date) {
        setExpectedDate(order.expected_delivery_date.split('T')[0]);
      }
      if (order.terms_and_conditions) {
        setTerms(order.terms_and_conditions);
      }
      setShippingCost(order.shipping_amount || 0);
    }
  }, [order]);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  // Financial calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  }, [items]);

  const gstTax = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const totalAmount = useMemo(() => subtotal + gstTax + shippingCost, [subtotal, gstTax, shippingCost]);
  const isAboveThreshold = totalAmount > 250000;

  // Handlers for Line Item edits
  const handleUpdateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };

      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? Math.max(1, Number(value) || 1) : target.quantity;
        const price = field === 'unit_price' ? Math.max(0, Number(value) || 0) : target.unit_price;
        target.quantity = qty;
        target.unit_price = price;
        target.total_amount = qty * price;
      }

      if (field === 'product_id') {
        const prod = allProducts.find(p => p.id === value);
        if (prod) {
          target.product_id = prod.id;
          target.product_name = prod.name;
          target.sku = prod.sku;
          target.unit_price = prod.benchmark_market_price;
          target.total_amount = target.quantity * prod.benchmark_market_price;
        }
      }

      copy[index] = target;
      return copy;
    });
  };

  const handleAddItem = () => {
    const defaultProduct = allProducts[0];
    const newItem: PurchaseOrderItem = {
      id: `poi-custom-${Date.now()}-${items.length + 1}`,
      purchase_order_id: order?.id || '',
      product_id: defaultProduct?.id || `prod-custom-${items.length}`,
      product_name: defaultProduct?.name || 'Custom Procurement Item',
      quantity: 5,
      unit_price: defaultProduct?.benchmark_market_price || 5000,
      total_amount: 5 * (defaultProduct?.benchmark_market_price || 5000)
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // AI Assistant Quick Actions
  const handleApplyVolumeDiscount = () => {
    setItems(prev =>
      prev.map(item => {
        const discounted = Math.round(item.unit_price * 0.95); // 5% discount
        return {
          ...item,
          unit_price: discounted,
          total_amount: item.quantity * discounted
        };
      })
    );
    setAiSuggestionMessage('AI Copilot applied a 5% negotiated bulk volume discount across all line items.');
    setTimeout(() => setAiSuggestionMessage(null), 5000);
  };

  const handleApplyExpeditedShipping = () => {
    const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setExpectedDate(date);
    setShippingCost(4500);
    setAiSuggestionMessage('AI Copilot adjusted expected delivery to expedited SLA (3 business days).');
    setTimeout(() => setAiSuggestionMessage(null), 5000);
  };

  const handleOptimizePackaging = () => {
    setShippingCost(1200);
    setAiSuggestionMessage('AI Copilot bundled item freight logistics, reducing shipping cost to ₹1,200.');
    setTimeout(() => setAiSuggestionMessage(null), 5000);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      if (mode === 'edit' && order) {
        const updated = await store.updatePurchaseOrder(order.id, {
          supplier_id: selectedSupplier.id,
          supplier_name: selectedSupplier.company_name,
          items: items.map(i => ({ ...i })),
          subtotal_amount: subtotal,
          tax_amount: gstTax,
          shipping_amount: shippingCost,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
          expected_delivery_date: new Date(expectedDate).toISOString(),
          terms_and_conditions: terms
        });
        if (updated && onSave) onSave(updated);
      } else {
        // Create manual PO
        const newPO = await store.createPurchaseOrder({
          organisation_id: org.id,
          organisation_name: org.name,
          supplier_id: selectedSupplier.id,
          supplier_name: selectedSupplier.company_name,
          created_by: currentUser.id,
          created_by_name: currentUser.full_name,
          subtotal_amount: subtotal,
          tax_amount: gstTax,
          shipping_amount: shippingCost,
          total_amount: totalAmount,
          currency: 'INR',
          status: 'pending_approval',
          items: items.map(i => ({ ...i })),
          delivery_address: deliveryAddress,
          expected_delivery_date: new Date(expectedDate).toISOString(),
          terms_and_conditions: terms
        });
        if (newPO && onSave) onSave(newPO);
      }
      onClose();
    } catch (err) {
      console.error('Error saving PO customization:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? `Customize Purchase Order ${order?.po_number}` : 'Create Customized Purchase Order'}
      subtitle="Manually configure products, quantities, prices, terms, and delivery, or use AI copilot refinement."
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs text-slate-800">
        {/* Top Badges & Context */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900">
              {mode === 'edit' ? `Editing: ${order?.po_number}` : 'Manual Order Studio'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-mono">Buyer: {currentUser.full_name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="neutral" dot>
              Buyer Mode: Manual & AI Hybrid
            </Badge>
            {isAboveThreshold ? (
              <Badge variant="warning" dot>
                Authorizations Gate: &gt; ₹2,50,000
              </Badge>
            ) : (
              <Badge variant="success" dot>
                Auto-Approval Eligible (&lt; ₹2.5L)
              </Badge>
            )}
          </div>
        </div>

        {/* AI Copilot Quick Assist Toolbar */}
        <div className="p-3 bg-gradient-to-r from-amber-500/10 via-[#FAF7F2] to-amber-500/5 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#13110F] text-[#F2C8A8] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 block text-[11px]">AI Copilot Procurement Refinement</span>
              <span className="text-[10px] text-slate-500">Apply verified supplier optimizations or negotiated rates with 1-click</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleApplyVolumeDiscount}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-1 transition-colors shadow-2xs"
            >
              <TrendingDown className="w-3 h-3 text-emerald-600" /> -5% Volume Discount
            </button>
            <button
              type="button"
              onClick={handleApplyExpeditedShipping}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Clock className="w-3 h-3 text-amber-600" /> 3-Day SLA
            </button>
            <button
              type="button"
              onClick={handleOptimizePackaging}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Truck className="w-3 h-3 text-blue-600" /> Bundle Freight
            </button>
          </div>
        </div>

        {/* AI Notification Banner */}
        {aiSuggestionMessage && (
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2 text-[11px] animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{aiSuggestionMessage}</span>
          </div>
        )}

        {/* Supplier & Delivery Metadata Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supplier Selector */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <label className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-slate-500" /> Supplier & Partner
            </label>
            <select
              value={selectedSupplierId}
              onChange={e => setSelectedSupplierId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.company_name} ({s.verification_status === 'verified' ? 'Verified' : 'Provisional'}) - SLA: {s.reliability_score}%
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Category: {selectedSupplier.business_category}</span>
              <span className="font-mono text-emerald-700 font-medium">Delivery Rating: {selectedSupplier.delivery_rating}%</span>
            </div>
          </div>

          {/* Expected Delivery Date & Shipping */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <label className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Delivery Date & Logistics
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Target Delivery</span>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={e => setExpectedDate(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Shipping Cost (₹)</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={shippingCost}
                  onChange={e => setShippingCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PO Line Items Customizer Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-semibold text-slate-900 text-xs">
                PO Line Items & Custom Elements ({items.length})
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-2.5 py-1 rounded-md bg-[#13110F] text-white hover:bg-black text-[11px] font-medium flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Product Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-100 tracking-wider">
                <tr>
                  <th className="py-2 px-3">Item / Product Name</th>
                  <th className="py-2 px-2.5 text-center w-24">Qty</th>
                  <th className="py-2 px-3 text-right w-32">Unit Price (₹)</th>
                  <th className="py-2 px-3 text-right w-32">Total (₹)</th>
                  <th className="py-2 px-2.5 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/60 transition-colors">
                    {/* Product Name / Picker */}
                    <td className="py-2 px-3">
                      <div className="space-y-1">
                        <select
                          value={item.product_id}
                          onChange={e => handleUpdateItem(index, 'product_id', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                        >
                          {allProducts.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.product_name}
                          onChange={e => handleUpdateItem(index, 'product_name', e.target.value)}
                          placeholder="Custom product specification description..."
                          className="w-full px-2 py-0.5 text-[11px] bg-transparent border-b border-slate-200 text-slate-600 focus:outline-none focus:border-slate-800"
                        />
                      </div>
                    </td>

                    {/* Quantity Stepper */}
                    <td className="py-2 px-2.5 text-center align-top pt-2.5">
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={item.quantity}
                        onChange={e => handleUpdateItem(index, 'quantity', e.target.value)}
                        className="w-16 px-1.5 py-1 text-center font-mono font-medium bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="py-2 px-3 text-right align-top pt-2.5">
                      <input
                        type="number"
                        min="1"
                        step="50"
                        value={item.unit_price}
                        onChange={e => handleUpdateItem(index, 'unit_price', e.target.value)}
                        className="w-24 px-2 py-1 text-right font-mono font-medium bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                      />
                    </td>

                    {/* Row Total */}
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 align-top pt-3 tabular-nums">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </td>

                    {/* Remove Action */}
                    <td className="py-2 px-2.5 text-center align-top pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1}
                        className={`p-1 rounded text-slate-400 hover:text-rose-600 transition-colors ${
                          items.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title="Remove Line Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delivery Address & Custom Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delivery Location */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <span className="text-[11px] font-semibold text-slate-900 block uppercase tracking-wider">
              Delivery Address & Consignee
            </span>
            <div className="space-y-1.5 text-xs">
              <input
                type="text"
                placeholder="Recipient / Company Name"
                value={deliveryAddress.recipient_name}
                onChange={e => setDeliveryAddress(prev => ({ ...prev, recipient_name: e.target.value }))}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
              />
              <input
                type="text"
                placeholder="Street Address / Suite"
                value={deliveryAddress.street}
                onChange={e => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
              />
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={e => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={deliveryAddress.state}
                  onChange={e => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                />
                <input
                  type="text"
                  placeholder="PIN"
                  value={deliveryAddress.postal_code}
                  onChange={e => setDeliveryAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
                />
              </div>
            </div>
          </div>

          {/* Custom Procurement Terms */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <span className="text-[11px] font-semibold text-slate-900 block uppercase tracking-wider">
              Terms & Special PO Instructions
            </span>
            <textarea
              rows={3}
              value={terms}
              onChange={e => setTerms(e.target.value)}
              placeholder="Custom warranty clauses, inspection terms, payment milestones..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#13110F] resize-none"
            />
          </div>
        </div>

        {/* Real-time Financial Recalculation Summary */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Recalculated PO Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight tabular-nums text-white">
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-[11px] text-slate-400">INR</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
              <span>Subtotal: {formatCurrency(subtotal)}</span>
              <span>•</span>
              <span>GST (18%): {formatCurrency(gstTax)}</span>
              <span>•</span>
              <span>Freight: {formatCurrency(shippingCost)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSaveOrder}
              className="bg-[#F2C8A8] text-[#13110F] hover:bg-[#ebd5c3] font-semibold flex-1 sm:flex-initial"
            >
              {mode === 'edit' ? 'Save PO Customization' : 'Create & Submit PO'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
