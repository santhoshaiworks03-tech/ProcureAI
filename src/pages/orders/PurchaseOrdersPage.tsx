import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  Printer
} from 'lucide-react';
import { store } from '../../lib/store';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import { generatePurchaseOrderPDF } from '../../services/pdf/pdfService';

export const PurchaseOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPoId = searchParams.get('id');

  const [orders, setOrders] = useState<PurchaseOrder[]>(store.getPurchaseOrders());
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

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

  const filteredOrders = orders.filter(po => {
    const matchesSearch =
      po.po_number.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      (po.payment_reference && po.payment_reference.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'payment_completed':
      case 'delivered':
        return <Badge variant="success">{status.replace('_', ' ').toUpperCase()}</Badge>;
      case 'approved':
        return <Badge variant="info">APPROVED (READY FOR CHECKOUT)</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">PENDING APPROVAL</Badge>;
      case 'payment_pending':
        return <Badge variant="info" className="animate-pulse">PAYMENT PENDING</Badge>;
      case 'rejected':
      case 'cancelled':
        return <Badge variant="danger">{status.toUpperCase()}</Badge>;
      default:
        return <Badge variant="default">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Purchase Order Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete procurement lifecycle tracking, exportable B2B PDF documentation, and PayPal settlement history.
          </p>
        </div>
        <Link to="/agent">
          <Button variant="primary" size="md">
            New Procurement Request
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO number, supplier, or payment reference..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['all', 'pending_approval', 'approved', 'payment_pending', 'payment_completed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap capitalize ${
                  statusFilter === st
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-navy-900'
                }`}
              >
                {st === 'all' ? 'All Orders' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Buyer / Department</th>
                <th className="py-3 px-3 text-right">Total Payable</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(po => (
                <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">
                    {po.po_number}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-navy-900 block">{po.supplier_name}</span>
                    <span className="text-[10px] text-slate-400">{po.items.length} line items</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    <span className="block font-medium">{po.created_by_name || 'Procurement Team'}</span>
                    <span className="text-[10px] text-slate-400">{po.organisation_name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-navy-900">
                    {formatCurrency(po.total_amount, po.currency)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {getStatusBadge(po.status)}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {formatDate(po.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(po)}
                      >
                        Inspect
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePurchaseOrderPDF(po)}
                        title="Download Official PDF"
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

      {/* PO Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Purchase Order: ${selectedOrder.po_number}`}
          subtitle={`Created on ${formatDateTime(selectedOrder.created_at)}`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Header Status & Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedOrder.status)}
                {selectedOrder.payment_reference && (
                  <span className="text-xs text-slate-600 font-mono">
                    Capture ID: <strong className="text-emerald-700">{selectedOrder.payment_reference}</strong>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => generatePurchaseOrderPDF(selectedOrder)}
                >
                  Download PDF
                </Button>
                {selectedOrder.status === 'approved' && (
                  <Link to={`/payments?po=${selectedOrder.id}`}>
                    <Button variant="paypal" size="sm">
                      Proceed to PayPal Checkout
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Buyer and Supplier info blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-2">
                  Buyer Information
                </h4>
                <p className="font-semibold text-navy-900">{selectedOrder.organisation_name || 'Apex Tech Solutions Pvt Ltd'}</p>
                <p className="text-slate-500">Contact: {selectedOrder.created_by_name || 'Strategic Procurement'}</p>
                <p className="text-slate-500">Shipping: {selectedOrder.delivery_address.street}, {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-2">
                  Supplier / Vendor
                </h4>
                <p className="font-semibold text-navy-900">{selectedOrder.supplier_name}</p>
                <p className="text-slate-500">Expected Delivery: {selectedOrder.expected_delivery_date || 'Within 5 Business Days'}</p>
                <p className="text-slate-500">Settlement: PayPal Express Business Gateway</p>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <h4 className="font-bold text-navy-900 text-xs mb-2">Order Line Items</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-navy-900">{line.product_name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{line.sku || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-navy-900">{line.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(line.unit_price)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-navy-900">{formatCurrency(line.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial summary breakdown */}
            <div className="flex justify-end">
              <div className="w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping & Logistics:</span>
                  <span>{formatCurrency(selectedOrder.shipping_amount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-navy-900">
                  <span>Total Payable:</span>
                  <span className="text-brand-blue">{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
