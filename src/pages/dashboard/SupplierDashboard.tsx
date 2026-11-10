import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  Building2,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Sliders,
  Check,
  X,
  MapPin,
  Mail,
  Phone,
  Eye,
  FileCheck2,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { store } from '../../lib/store';
import { Supplier, SupplierProduct, PurchaseOrder, SupplierRFQ, SupplierQuotation, Product } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';

export const SupplierDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [suppliers, setSuppliers] = useState<Supplier[]>(store.getSuppliers());
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>(store.getSupplierProducts());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(store.getPurchaseOrders());
  const [rfqs, setRfqs] = useState<SupplierRFQ[]>(store.getSupplierRfqs());
  const [quotations, setQuotations] = useState<SupplierQuotation[]>(store.getSupplierQuotations());
  const [globalProducts, setGlobalProducts] = useState<Product[]>(store.getProducts());

  // Quotation submission modal state
  const [quotingRfq, setQuotingRfq] = useState<SupplierRFQ | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [quoteTax, setQuoteTax] = useState<number>(0);
  const [quoteShipping, setQuoteShipping] = useState<number>(12000);
  const [quoteDeliveryDays, setQuoteDeliveryDays] = useState<number>(3);
  const [quoteNotes, setQuoteNotes] = useState<string>('Includes standard manufacturer warranty and delivery to site.');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Listing edit modal state
  const [editingListing, setEditingListing] = useState<SupplierProduct | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMoq, setEditMoq] = useState<number>(1);
  const [editLeadTime, setEditLeadTime] = useState<number>(3);

  // Filter supplier data to authenticated supplier: OmniOffice Direct Ltd (sup-01)
  const mySupplier = suppliers.find(s => s.id === 'sup-01') || suppliers[0];

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSuppliers(store.getSuppliers());
      setSupplierProducts(store.getSupplierProducts());
      setPurchaseOrders(store.getPurchaseOrders());
      setRfqs(store.getSupplierRfqs());
      setQuotations(store.getSupplierQuotations());
      setGlobalProducts(store.getProducts());
    });
    return unsub;
  }, []);

  // OmniOffice Direct scoped data
  const myListings = supplierProducts.filter(sp => sp.supplier_id === mySupplier.id);
  const myOrders = purchaseOrders.filter(
    po => po.supplier_id === mySupplier.id || po.supplier_name.toLowerCase().includes('omni')
  );
  const myQuotations = quotations.filter(q => q.supplier_id === mySupplier.id);

  // Metrics
  const totalActiveProducts = myListings.length;
  const activeProductListings = myListings.filter(l => l.listing_status === 'active').length;
  const pendingRfqsCount = rfqs.filter(r => r.status === 'pending').length;
  const quotationsSubmittedCount = myQuotations.length;
  const incomingOrdersCount = myOrders.length;
  const ordersAwaitingDispatch = myOrders.filter(
    po => po.status === 'approved' || po.status === 'confirmed' || po.status === 'processing'
  ).length;
  const completedOrdersCount = myOrders.filter(
    po => po.status === 'delivered' || po.status === 'payment_completed'
  ).length;
  const totalSalesRevenue = myOrders
    .filter(po => po.status === 'payment_completed' || po.status === 'delivered' || po.status === 'shipped')
    .reduce((sum, po) => sum + po.total_amount, 862500);

  // Actions
  const handleDispatch = async (poId: string) => {
    await store.updatePurchaseOrderStatus(poId, 'shipped', {
      courier: 'BlueDart Express Commercial',
      tracking_number: `BD-IN-${Date.now().toString().slice(-8)}`,
      dispatch_time: new Date().toISOString()
    });
  };

  const handleDeliver = async (poId: string) => {
    await store.updatePurchaseOrderStatus(poId, 'delivered', {
      delivered_at: new Date().toISOString(),
      pod_signature: 'Verified Electronic POD'
    });
  };

  const handleQuickRestock = (listingId: string) => {
    store.updateSupplierProductStock(listingId, 25);
  };

  const handleToggleListingStatus = (listingId: string, currentStatus: string) => {
    store.updateSupplierListingDetails(listingId, {
      listing_status: currentStatus === 'active' ? 'delisted' : 'active'
    });
  };

  const handleOpenQuoteModal = (rfq: SupplierRFQ) => {
    setQuotingRfq(rfq);
    const subtotal = rfq.items.reduce((sum, item) => sum + item.target_price * item.quantity, 0);
    setQuotePrice(subtotal);
    setQuoteTax(Math.round(subtotal * 0.18));
    setQuoteShipping(12000);
    setQuoteDeliveryDays(3);
    setQuoteNotes('Direct warehouse dispatch from Bengaluru facility with 5-year warranty.');
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingRfq) return;
    setIsSubmittingQuote(true);

    const total = quotePrice + quoteTax + quoteShipping;
    store.submitSupplierQuotation({
      rfq_id: quotingRfq.id,
      rfq_number: quotingRfq.rfq_number,
      supplier_id: mySupplier.id,
      supplier_name: mySupplier.company_name,
      quoted_amount: quotePrice,
      tax_amount: quoteTax,
      shipping_amount: quoteShipping,
      total_amount: total,
      delivery_days: quoteDeliveryDays,
      status: 'submitted',
      valid_until: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      notes: quoteNotes
    });

    setIsSubmittingQuote(false);
    setQuotingRfq(null);
  };

  const handleRejectRfq = (rfqId: string) => {
    store.rejectSupplierRfq(rfqId, 'Capacity constraint for requested delivery window');
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    store.updateSupplierListingDetails(editingListing.id, {
      unit_price: editPrice,
      min_order_quantity: editMoq,
      estimated_delivery_days: editLeadTime
    });
    setEditingListing(null);
  };

  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'profile', label: 'Business Profile' },
    { id: 'verification', label: 'Verification & Documents' },
    { id: 'products', label: 'Product Management' },
    { id: 'inventory', label: 'Inventory Management' },
    { id: 'rfqs', label: 'RFQ Management' },
    { id: 'quotations', label: 'Quotations' },
    { id: 'orders', label: 'Purchase Orders' },
    { id: 'fulfilment', label: 'Order Fulfilment' },
    { id: 'payments', label: 'Payments & Transactions' },
    { id: 'analytics', label: 'Performance Analytics' }
  ];

  return (
    <div className="space-y-6">
      {/* Supplier Hub Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(19,17,15,0.08)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#13110F]">Supplier Fulfillment Hub</h1>
            <Badge variant="success" dot size="sm">Commercial Vendor Portal</Badge>
          </div>
          <p className="text-xs text-[#6B6560] mt-0.5">
            {mySupplier.company_name} • GSTIN: <span className="font-mono">{mySupplier.gstin_tax_id}</span> • Verified Commercial Vendor
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="neutral">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 inline mr-1" />
            PayPal Merchant Verified
          </Badge>
          <span className="text-xs font-mono text-[#13110F] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[rgba(19,17,15,0.08)]">
            Vendor ID: {mySupplier.id}
          </span>
        </div>
      </div>

      {/* Supplier Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[rgba(19,17,15,0.08)]">
        {navTabs.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSearchParams({ tab: t.id })}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#13110F] text-white shadow-sm'
                  : 'text-[#6B6560] hover:text-[#13110F] hover:bg-[#FAF7F2]'
              }`}
            >
              {t.label}
              {t.id === 'rfqs' && pendingRfqsCount > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white text-[#13110F]' : 'bg-[#13110F] text-white'
                }`}>
                  {pendingRfqsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 8 Supplier Key Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Total Active Products</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{totalActiveProducts}</p>
          <span className="text-[10px] text-emerald-700 font-medium">In catalogue</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Active Product Listings</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{activeProductListings}</p>
          <span className="text-[10px] text-[#6B6560]">Ready to sell</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Pending RFQs</span>
          <p className="text-xl font-bold text-[#92400E] mt-1 font-mono tabular-nums">{pendingRfqsCount}</p>
          <span className="text-[10px] text-[#D97706] font-medium">Action required</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Quotations Submitted</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{quotationsSubmittedCount}</p>
          <span className="text-[10px] text-[#6B6560]">87.5% win rate</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Incoming Purchase Orders</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{incomingOrdersCount}</p>
          <span className="text-[10px] text-[#6B6560]">Confirmed</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Orders Awaiting Dispatch</span>
          <p className="text-xl font-bold text-[#8C522A] mt-1 font-mono tabular-nums">{ordersAwaitingDispatch}</p>
          <span className="text-[10px] text-[#C27D4E] font-medium">Ready to ship</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Completed Orders</span>
          <p className="text-xl font-bold text-[#3E5C31] mt-1 font-mono tabular-nums">{completedOrdersCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">98.4% SLA</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Total Sales Revenue</span>
          <p className="text-base font-bold text-[#13110F] mt-1 font-mono tabular-nums truncate">
            {formatCurrency(totalSalesRevenue)}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">PayPal settled</span>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & DISPATCH RADAR
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'fulfilment' || activeTab === 'orders') && (
        <div className="space-y-6">
          {/* Order Fulfilment Queue */}
          <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Order Fulfilment & Dispatch Pipeline</h3>
              </div>
              <span className="text-[11px] text-[#6B6560]">
                {myOrders.length} active commercial orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">PO Number</th>
                    <th className="py-2.5 px-4 font-semibold">Client Enterprise</th>
                    <th className="py-2.5 px-4 font-semibold">Line Items</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Order Value</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Fulfilment Stage</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                  {myOrders.map(po => {
                    const isPaid = po.status === 'payment_completed' || po.status === 'approved';
                    const isShipped = po.status === 'shipped';
                    const isDelivered = po.status === 'delivered';

                    return (
                      <tr key={po.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[#13110F]">
                          {po.po_number}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#13110F] block">{po.organisation_name || 'Apex Tech Solutions'}</span>
                          <span className="text-[10px] text-[#8C847D]">Bengaluru Campus</span>
                        </td>
                        <td className="py-3 px-4 text-[#6B6560]">
                          {po.items.map(i => `${i.product_name} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#13110F] tabular-nums">
                          {formatCurrency(po.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              isDelivered
                                ? 'success'
                                : isShipped
                                ? 'info'
                                : isPaid
                                ? 'neutral'
                                : 'warning'
                            }
                            dot
                            size="sm"
                          >
                            {po.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPaid && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDispatch(po.id)}
                              className="rounded-xl shadow-sm text-xs"
                            >
                              Dispatch Order
                            </Button>
                          )}
                          {isShipped && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeliver(po.id)}
                              className="rounded-xl text-xs"
                            >
                              Confirm Delivery
                            </Button>
                          )}
                          {isDelivered && (
                            <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: RFQ & QUOTATION MANAGEMENT
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'rfqs' || activeTab === 'quotations') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#13110F] uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#13110F]" />
              Buyer Request for Quotations (RFQs)
            </h3>
            <span className="text-[11px] text-[#8C847D]">
              Direct commercial opportunities from verified buyers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rfqs.map(rfq => {
              const hasQuoted = myQuotations.some(q => q.rfq_id === rfq.id);

              return (
                <Card key={rfq.id} className="p-5 flex flex-col justify-between border-[rgba(19,17,15,0.08)] bg-white space-y-4 shadow-subtle">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#8C847D] block">{rfq.rfq_number}</span>
                        <h4 className="text-xs font-bold text-[#13110F] mt-0.5">{rfq.title}</h4>
                      </div>
                      <Badge
                        variant={
                          rfq.status === 'quoted' || hasQuoted
                            ? 'neutral'
                            : rfq.status === 'accepted'
                            ? 'success'
                            : rfq.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {hasQuoted ? 'Quoted' : rfq.status}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-[#6B6560]">
                        <span>Buyer Organization:</span>
                        <span className="font-semibold text-[#13110F]">{rfq.organisation_name}</span>
                      </div>
                      <div className="flex justify-between text-[#6B6560]">
                        <span>Budget Cap:</span>
                        <span className="font-mono font-bold text-[#13110F]">{formatCurrency(rfq.max_budget)}</span>
                      </div>
                      <div className="flex justify-between text-[#6B6560]">
                        <span>Required Delivery:</span>
                        <span className="font-mono text-[#13110F]">{rfq.delivery_deadline}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono text-[#8C847D] block">Items Requested</span>
                      {rfq.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-[#13110F]">
                          <span className="truncate max-w-[180px]">{it.product_name}</span>
                          <span className="font-mono font-semibold">{it.quantity} units</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[rgba(19,17,15,0.06)] flex items-center gap-2">
                    {hasQuoted ? (
                      <span className="text-xs font-semibold text-[#13110F] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Quotation active & under evaluation
                      </span>
                    ) : rfq.status === 'rejected' ? (
                      <span className="text-xs text-rose-600">Declined due to schedule</span>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 rounded-xl text-xs"
                          onClick={() => handleOpenQuoteModal(rfq)}
                        >
                          Submit Quotation
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs"
                          onClick={() => handleRejectRfq(rfq.id)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PRODUCT & INVENTORY MANAGEMENT
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'products' || activeTab === 'inventory') && (
        <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#13110F]" />
              <h3 className="text-xs font-semibold text-[#13110F]">Product Listings & Real-Time Stock Management</h3>
            </div>
            <span className="text-[11px] text-[#6B6560]">
              Controlled by OmniOffice Direct
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Product</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Contracted Price</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Available Stock</th>
                  <th className="py-2.5 px-4 font-semibold text-center">MOQ</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Lead Time</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                {myListings.map(listing => {
                  const isLow = listing.available_stock < 15;

                  return (
                    <tr key={listing.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#13110F] block">
                          {listing.product?.name || 'Commercial Furniture Item'}
                        </span>
                        <span className="text-[10px] text-[#8C847D]">{listing.product?.brand || 'OmniOffice'}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#13110F] tabular-nums">
                        {formatCurrency(listing.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded-full text-xs ${
                          isLow ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {listing.available_stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[#6B6560]">
                        {listing.min_order_quantity} unit
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[#6B6560]">
                        {listing.estimated_delivery_days} days
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={listing.listing_status === 'active' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {listing.listing_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickRestock(listing.id)}
                          className="rounded-xl text-xs py-1"
                        >
                          +25 Restock
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingListing(listing);
                            setEditPrice(listing.unit_price);
                            setEditMoq(listing.min_order_quantity);
                            setEditLeadTime(listing.estimated_delivery_days);
                          }}
                          className="rounded-xl text-xs py-1"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BUSINESS PROFILE & VERIFICATION
         ========================================================================= */}
      {(activeTab === 'profile' || activeTab === 'verification') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Business Legal Entity Profile</h3>
              </div>
              <Badge variant="success" dot size="sm">KYC Verified</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#8C847D] block">Company Name</span>
                  <span className="font-semibold text-[#13110F]">{mySupplier.company_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C847D] block">Legal Name</span>
                  <span className="font-semibold text-[#13110F]">{mySupplier.legal_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C847D] block">GSTIN / Corporate Tax ID</span>
                  <span className="font-mono font-semibold text-[#13110F]">{mySupplier.gstin_tax_id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C847D] block">Corporate PAN</span>
                  <span className="font-mono font-semibold text-[#13110F]">AAACH1122M</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[rgba(19,17,15,0.06)] space-y-1.5">
                <div className="flex items-center gap-2 text-[#6B6560]">
                  <MapPin className="w-3.5 h-3.5 text-[#8C847D]" />
                  <span>Plot 44, Peenya Industrial Area, Phase II, Bengaluru, Karnataka 560058</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B6560]">
                  <Mail className="w-3.5 h-3.5 text-[#8C847D]" />
                  <span>{mySupplier.contact_email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#6B6560]">
                  <Phone className="w-3.5 h-3.5 text-[#8C847D]" />
                  <span>{mySupplier.contact_phone}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Legal Compliance & KYC Documents</h3>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">100% Complete</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'GST Registration Certificate (REG-06)', ref: '29AAACH1122M1ZX', date: 'Verified 2024-01-15' },
                { name: 'Corporate PAN Card Verification', ref: 'AAACH1122M', date: 'Verified 2024-01-15' },
                { name: 'MSME Udyam Registration Certificate', ref: 'UDYAM-KR-03-0029411', date: 'Verified 2024-01-16' },
                { name: 'PayPal Merchant Account Integration', ref: 'sb-omnioffice@procureai.io', date: 'Verified 2024-01-16' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#13110F] block">{doc.name}</span>
                    <span className="text-[10px] font-mono text-[#8C847D]">{doc.ref}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {doc.date}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 5: PAYMENTS & PAYPAL SETTLEMENTS
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'payments') && (
        <Card className="p-5 bg-white border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#13110F]" />
              <h3 className="text-xs font-semibold text-[#13110F]">PayPal Merchant Gateway Settlements</h3>
            </div>
            <span className="text-[11px] font-mono text-[#13110F] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[rgba(19,17,15,0.08)]">
              Account: {mySupplier.paypal_email || 'sb-omnioffice@procureai.io'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.08)]">
              <span className="text-[11px] text-[#8C847D] block">Total Settled Volume</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">{formatCurrency(totalSalesRevenue)}</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Direct PayPal capture</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.08)]">
              <span className="text-[11px] text-[#8C847D] block">Pending Payouts</span>
              <p className="text-2xl font-bold text-[#92400E] mt-1 font-mono">₹0</p>
              <p className="text-[10px] text-[#6B6560] mt-0.5">All captured funds disbursed</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.08)]">
              <span className="text-[11px] text-[#8C847D] block">Gateway Transaction Fee</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">1.9% + ₹3</p>
              <p className="text-[10px] text-[#6B6560] mt-0.5">Commercial enterprise rate</p>
            </div>
          </div>
        </Card>
      )}

      {/* =========================================================================
          MODAL: SUBMIT QUOTATION
         ========================================================================= */}
      <AnimatePresence>
        {quotingRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[rgba(19,17,15,0.1)] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#13110F]">Submit Commercial Quotation</h3>
                  <span className="text-[11px] text-[#8C847D] font-mono">{quotingRfq.rfq_number} • {quotingRfq.title}</span>
                </div>
                <button onClick={() => setQuotingRfq(null)} className="p-1 rounded-lg text-[#8C847D] hover:text-[#13110F]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitQuote} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                    Base Quotation Amount (Excl. Tax)
                  </label>
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setQuotePrice(val);
                      setQuoteTax(Math.round(val * 0.18));
                    }}
                    required
                    className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs focus:ring-1 focus:ring-[#13110F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">GST (18%)</label>
                    <input
                      type="number"
                      value={quoteTax}
                      onChange={e => setQuoteTax(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs focus:ring-1 focus:ring-[#13110F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">Freight & Shipping</label>
                    <input
                      type="number"
                      value={quoteShipping}
                      onChange={e => setQuoteShipping(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs focus:ring-1 focus:ring-[#13110F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">Estimated Lead Time (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={quoteDeliveryDays}
                      onChange={e => setQuoteDeliveryDays(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs focus:ring-1 focus:ring-[#13110F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">Total Quoted Value</label>
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] font-mono font-bold text-xs text-[#13110F]">
                      {formatCurrency(quotePrice + quoteTax + quoteShipping)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#13110F] block mb-1">Commercial Terms & Warranty Notes</label>
                  <textarea
                    rows={2}
                    value={quoteNotes}
                    onChange={e => setQuoteNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] text-xs focus:ring-1 focus:ring-[#13110F]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setQuotingRfq(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={isSubmittingQuote}>
                    Submit Binding Quotation
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: EDIT LISTING
         ========================================================================= */}
      <AnimatePresence>
        {editingListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[rgba(19,17,15,0.1)] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
                <h3 className="text-sm font-bold text-[#13110F]">Edit Supplier Listing Pricing</h3>
                <button onClick={() => setEditingListing(null)} className="p-1 rounded-lg text-[#8C847D] hover:text-[#13110F]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveListing} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#13110F] block mb-1">Contracted Unit Price (₹)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs focus:ring-1 focus:ring-[#13110F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">Minimum Order Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={editMoq}
                      onChange={e => setEditMoq(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs focus:ring-1 focus:ring-[#13110F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={editLeadTime}
                      onChange={e => setEditLeadTime(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs focus:ring-1 focus:ring-[#13110F]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditingListing(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
