import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Search,
  ExternalLink,
  Plus,
  Edit3
} from 'lucide-react';
import { store } from '../../lib/store';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import { generatePurchaseOrderPDF } from '../../services/pdf/pdfService';
import { OrderTrackingTimeline } from '../../components/orders/OrderTrackingTimeline';
import { PurchaseOrderCustomizerModal } from '../../components/orders/PurchaseOrderCustomizerModal';

export const PurchaseOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPoId = searchParams.get('id');

  const [orders, setOrders] = useState<PurchaseOrder[]>(store.getPurchaseOrders());
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Manual PO Customizer State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizingOrder, setCustomizingOrder] = useState<PurchaseOrder | null>(null);
  const [customizerMode, setCustomizerMode] = useState<'edit' | 'create'>('edit');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setOrders(store.getPurchaseOrders());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (initialPoId) {
      const found = store.getPurchaseOrderById(initialPoId);
      if (found) setSelectedOrder(found);
    }
  }, [initialPoId]);

  const filteredOrders = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders.filter(po => {
      const matchesSearch =
        !s ||
        po.po_number.toLowerCase().includes(s) ||
        po.supplier_name.toLowerCase().includes(s) ||
        (po.payment_reference && po.payment_reference.toLowerCase().includes(s));

      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'payment_completed':
      case 'delivered':
        return <Badge variant="success" dot>{status.replace('_', ' ')}</Badge>;
      case 'approved':
        return <Badge variant="info" dot>Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="warning" dot>Pending approval</Badge>;
      case 'payment_pending':
        return <Badge variant="info" dot>Payment pending</Badge>;
      case 'rejected':
      case 'cancelled':
        return <Badge variant="danger" dot>{status}</Badge>;
      default:
        return <Badge variant="default" dot>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Purchase Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full lifecycle documentation, official PDF invoice generation, and PayPal payment tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setCustomizingOrder(null);
              setCustomizerMode('create');
              setIsCustomizerOpen(true);
            }}
          >
            Create Manual PO
          </Button>
          <Link to="/agent">
            <Button variant="primary" size="sm">
              New procurement request
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO number, supplier, or capture ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#13110F]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['all', 'pending_approval', 'approved', 'payment_pending', 'payment_completed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap capitalize ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All orders' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 text-slate-500 text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-medium">PO number</th>
                <th className="py-2.5 px-3 font-medium">Supplier</th>
                <th className="py-2.5 px-3 font-medium">Buyer</th>
                <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
                <th className="py-2.5 px-3 font-medium">Date</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(po => (
                <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {po.po_number}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-900 block">{po.supplier_name}</span>
                    <span className="text-[10px] text-slate-400">{po.items.length} line items</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <span className="block">{po.created_by_name || 'Procurement Officer'}</span>
                    <span className="text-[10px] text-slate-400">{po.organisation_name}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900 tabular-nums">
                    {formatCurrency(po.total_amount, po.currency)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {getStatusBadge(po.status)}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {formatDate(po.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(po)}
                      >
                        Inspect
                      </Button>
                      {(po.status === 'pending_approval' || po.status === 'approved') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomizingOrder(po);
                            setCustomizerMode('edit');
                            setIsCustomizerOpen(true);
                          }}
                          title="Edit & Customize PO Elements"
                          leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-700" />}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePurchaseOrderPDF(po)}
                        title="Download PDF Invoice"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                      </Button>
                      {po.status === 'approved' && (
                        <Link to={`/payments?po=${po.id}`}>
                          <Button variant="paypal" size="sm">
                            Checkout
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Purchase Order ${selectedOrder.po_number}`}
          subtitle={`Issued on ${formatDateTime(selectedOrder.created_at)}`}
          maxWidth="xl"
        >
          <div className="space-y-5 text-xs">
            {/* Status & actions bar */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedOrder.status)}
                {selectedOrder.payment_reference && (
                  <span className="font-mono text-slate-600">
                    Capture ID: <strong className="text-slate-900">{selectedOrder.payment_reference}</strong>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(selectedOrder.status === 'pending_approval' || selectedOrder.status === 'approved') && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setCustomizingOrder(selectedOrder);
                      setCustomizerMode('edit');
                      setIsCustomizerOpen(true);
                    }}
                  >
                    Edit PO Elements
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => generatePurchaseOrderPDF(selectedOrder)}
                >
                  Download PDF
                </Button>
                {selectedOrder.status === 'approved' && (
                  <Link to={`/payments?po=${selectedOrder.id}`}>
                    <Button variant="paypal" size="sm">
                      PayPal checkout
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* 8-Stage Real-Time Procurement Lifecycle Timeline */}
            <OrderTrackingTimeline order={selectedOrder} />

            {/* Buyer and Supplier details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Buyer</span>
                <p className="font-medium text-slate-900">{selectedOrder.organisation_name || 'Apex Tech Solutions'}</p>
                <p className="text-slate-500">Officer: {selectedOrder.created_by_name || 'Strategic Procurement'}</p>
                <p className="text-slate-500">Location: {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Vendor</span>
                <p className="font-medium text-slate-900">{selectedOrder.supplier_name}</p>
                <p className="text-slate-500">Expected delivery: {selectedOrder.expected_delivery_date || 'Within 5 business days'}</p>
                <p className="text-slate-500">Terms: Net 30 / PayPal Express</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-50/70 text-slate-500 text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-medium">Description</th>
                    <th className="py-2 px-3 font-medium text-center">Qty</th>
                    <th className="py-2 px-3 font-medium text-right">Unit price</th>
                    <th className="py-2 px-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="py-2 px-3 font-medium text-slate-900">{line.product_name}</td>
                      <td className="py-2 px-3 text-center font-medium text-slate-900 tabular-nums">{line.quantity}</td>
                      <td className="py-2 px-3 text-right text-slate-600 tabular-nums">{formatCurrency(line.unit_price)}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900 tabular-nums">{formatCurrency(line.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-1">
              <div className="w-64 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">{formatCurrency(selectedOrder.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="tabular-nums">{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="tabular-nums">{formatCurrency(selectedOrder.shipping_amount)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-semibold text-slate-900 text-sm">
                  <span>Total:</span>
                  <span className="tabular-nums">{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Purchase Order Customizer Modal */}
      <PurchaseOrderCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        order={customizerMode === 'edit' ? customizingOrder : null}
        mode={customizerMode}
        onSave={saved => {
          setOrders(store.getPurchaseOrders());
          if (selectedOrder && selectedOrder.id === saved.id) {
            setSelectedOrder(saved);
          }
        }}
      />
    </div>
  );
};
