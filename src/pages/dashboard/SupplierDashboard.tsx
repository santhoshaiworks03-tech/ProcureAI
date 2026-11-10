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
  ArrowUpRight,
  CheckSquare,
  LayoutDashboard
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

  // Section Heading & Subtitle configuration alone for each respective menu
  const MENU_HEADINGS: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Supplier Fulfillment Hub',
      subtitle: `${mySupplier.company_name} • GSTIN: ${mySupplier.gstin_tax_id} • Verified Commercial Vendor`
    },
    profile: {
      title: 'Business Profile',
      subtitle: 'Company legal identity, GSTIN registration, tax classification, and contact details'
    },
    verification: {
      title: 'Verification & Documents',
      subtitle: 'Corporate documentation, tax identification certificates, and compliance credentials'
    },
    products: {
      title: 'Product Management',
      subtitle: 'Global catalogue listings, supplier contracted unit prices, and delivery terms'
    },
    inventory: {
      title: 'Inventory Management',
      subtitle: 'Real-time available stock, reserved units, low-stock thresholds, and replenishment'
    },
    rfqs: {
      title: 'RFQ Management',
      subtitle: 'Buyer Requests for Quotation (RFQs) and direct commercial procurement requests'
    },
    quotations: {
      title: 'Quotations',
      subtitle: 'Submitted commercial quotations, itemized pricing, taxes, and delivery commitments'
    },
    orders: {
      title: 'Purchase Orders',
      subtitle: 'Incoming commercial purchase orders from registered enterprise buyers'
    },
    fulfilment: {
      title: 'Order Fulfilment',
      subtitle: 'Dispatch pipeline, courier shipment tracking, and electronic Proof of Delivery'
    },
    payments: {
      title: 'Payments & Transactions',
      subtitle: 'PayPal merchant capture settlements, transaction history, and disbursement details'
    },
    analytics: {
      title: 'Performance Analytics',
      subtitle: 'Fulfillment performance metrics, quotation win rates, and SLA benchmarks'
    }
  };

  const currentMenu = MENU_HEADINGS[activeTab] || MENU_HEADINGS.overview;

  return (
    <div className="space-y-6">
      {/* =========================================================================
          DYNAMIC MENU HEADING ALONE (NO DUPLICATE HORIZONTAL TAB BAR)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(19,17,15,0.08)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#13110F]">
              {currentMenu.title}
            </h1>
            {activeTab === 'overview' ? (
              <Badge variant="success" dot size="sm">Commercial Vendor Portal</Badge>
            ) : (
              <Badge variant="neutral" size="sm">OmniOffice Direct</Badge>
            )}
          </div>
          <p className="text-xs text-[#6B6560] mt-0.5">
            {currentMenu.subtitle}
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

      {/* =========================================================================
          8 KEY PERFORMANCE INDICATORS — DISPLAYED TO OVERVIEW ALONE
         ========================================================================= */}
      {activeTab === 'overview' && (
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
      )}

      {/* =========================================================================
          SECTION: BUSINESS PROFILE
         ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Business Legal Entity Profile</h3>
              </div>
              <Badge variant="success" dot size="sm">KYC Verified</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)]">
                  <span className="text-[10px] text-[#8C847D] block">Company Name</span>
                  <span className="font-semibold text-[#13110F] text-sm">{mySupplier.company_name}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)]">
                  <span className="text-[10px] text-[#8C847D] block">Legal Registered Entity</span>
                  <span className="font-semibold text-[#13110F] text-sm">{mySupplier.legal_name}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)]">
                  <span className="text-[10px] text-[#8C847D] block">GSTIN / Corporate Tax ID</span>
                  <span className="font-mono font-bold text-[#13110F] text-sm">{mySupplier.gstin_tax_id}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)]">
                  <span className="text-[10px] text-[#8C847D] block">Corporate PAN</span>
                  <span className="font-mono font-bold text-[#13110F] text-sm">AAACH1122M</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(19,17,15,0.06)] space-y-2">
                <div className="flex items-center gap-2.5 text-[#6B6560]">
                  <MapPin className="w-4 h-4 text-[#8C847D] flex-shrink-0" />
                  <span>Plot 44, Peenya Industrial Area, Phase II, Bengaluru, Karnataka 560058</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#6B6560]">
                  <Mail className="w-4 h-4 text-[#8C847D] flex-shrink-0" />
                  <span>{mySupplier.contact_email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#6B6560]">
                  <Phone className="w-4 h-4 text-[#8C847D] flex-shrink-0" />
                  <span>{mySupplier.contact_phone}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          SECTION: VERIFICATION & DOCUMENTS
         ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Legal Compliance & KYC Document Submissions</h3>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Complete & Verified
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: 'GST Registration Certificate (REG-06)', ref: '29AAACH1122M1ZX', date: 'Verified 2024-01-15', status: 'Compliant' },
                { name: 'Corporate PAN Card Verification', ref: 'AAACH1122M', date: 'Verified 2024-01-15', status: 'Compliant' },
                { name: 'MSME Udyam Registration Certificate', ref: 'UDYAM-KR-03-0029411', date: 'Verified 2024-01-16', status: 'Compliant' },
                { name: 'PayPal Merchant Account Integration', ref: 'sb-omnioffice@procureai.io', date: 'Verified 2024-01-16', status: 'Connected' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#13110F] block text-xs">{doc.name}</span>
                    <span className="text-[10px] font-mono text-[#8C847D] mt-0.5 block">{doc.ref}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-700 font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {doc.date}
                    </span>
                    <span className="block text-[10px] text-[#8C847D]">{doc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          SECTION: PRODUCT MANAGEMENT
         ========================================================================= */}
      {activeTab === 'products' && (
        <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden space-y-0">
          <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#13110F]" />
              <h3 className="text-xs font-semibold text-[#13110F]">Commercial Product Listings</h3>
            </div>
            <span className="text-[11px] text-[#6B6560]">
              {myListings.length} items configured
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
                  <th className="py-2.5 px-4 font-semibold text-center">Listing Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                {myListings.map(listing => (
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
                      <span className="font-mono font-bold tabular-nums px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-800">
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
                        Edit Price
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleListingStatus(listing.id, listing.listing_status)}
                        className="rounded-xl text-xs py-1"
                      >
                        {listing.listing_status === 'active' ? 'Delist' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: INVENTORY MANAGEMENT
         ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Available Stock</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">
                {myListings.reduce((sum, l) => sum + l.available_stock, 0)} units
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">Ready in warehouse</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Reserved for Orders</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">15 units</p>
              <span className="text-[10px] text-[#6B6560]">Allocated to POs</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Available-to-Sell (ATS)</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">
                {myListings.reduce((sum, l) => sum + l.available_stock, 0) - 15} units
              </p>
              <span className="text-[10px] text-[#6B6560]">Commercial stock</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Low Stock Alerts</span>
              <p className="text-2xl font-bold text-[#92400E] mt-1 font-mono">
                {myListings.filter(l => l.available_stock < 15).length}
              </p>
              <span className="text-[10px] text-[#D97706] font-medium">Restock recommended</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Real-time Inventory Replenishment & Stock Levels</h3>
              </div>
              <span className="text-[11px] text-[#6B6560]">OmniOffice Peenya Facility</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Product Name</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Current Stock</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Reserved</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Available-To-Sell</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Restock Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                  {myListings.map(listing => {
                    const isLow = listing.available_stock < 15;
                    return (
                      <tr key={listing.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#13110F]">
                          {listing.product?.name}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {listing.available_stock} units
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#8C847D]">
                          5 units
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800">
                          {Math.max(0, listing.available_stock - 5)} units
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={isLow ? 'warning' : 'success'} size="sm">
                            {isLow ? 'Low Stock Threshold' : 'Optimal Depth'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleQuickRestock(listing.id)}
                            className="rounded-xl text-xs py-1"
                          >
                            +25 Restock
                          </Button>
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
          SECTION: RFQ MANAGEMENT
         ========================================================================= */}
      {activeTab === 'rfqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B6560]">
              {rfqs.length} buyer requests matching your category
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
          SECTION: QUOTATIONS
         ========================================================================= */}
      {activeTab === 'quotations' && (
        <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#13110F]" />
              <h3 className="text-xs font-semibold text-[#13110F]">Submitted Commercial Quotations</h3>
            </div>
            <span className="text-[11px] text-[#6B6560]">
              {myQuotations.length} quotations active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Quotation ID</th>
                  <th className="py-2.5 px-4 font-semibold">RFQ Reference</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Quoted Base</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Tax & Freight</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total Value</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Delivery Window</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Evaluation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                {myQuotations.map(quote => (
                  <tr key={quote.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#13110F]">
                      {quote.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#13110F] block">{quote.rfq_number}</span>
                      <span className="text-[10px] text-[#8C847D]">Direct buyer invitation</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#13110F]">
                      {formatCurrency(quote.quoted_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#6B6560]">
                      {formatCurrency(quote.tax_amount + quote.shipping_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#13110F]">
                      {formatCurrency(quote.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#6B6560]">
                      {quote.delivery_days} business days
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success" size="sm">
                        {quote.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: PURCHASE ORDERS
         ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#13110F]" />
              <h3 className="text-xs font-semibold text-[#13110F]">Client Purchase Orders</h3>
            </div>
            <span className="text-[11px] text-[#6B6560]">
              {myOrders.length} commercial orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">PO Number</th>
                  <th className="py-2.5 px-4 font-semibold">Client Enterprise</th>
                  <th className="py-2.5 px-4 font-semibold">Items</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Order Value</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
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
                          variant={isDelivered ? 'success' : isShipped ? 'info' : isPaid ? 'neutral' : 'warning'}
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
      )}

      {/* =========================================================================
          SECTION: ORDER FULFILMENT
         ========================================================================= */}
      {activeTab === 'fulfilment' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Order Fulfilment & Dispatch Pipeline</h3>
              </div>
              <span className="text-[11px] text-[#6B6560]">BlueDart Express Logistics</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">PO Number</th>
                    <th className="py-2.5 px-4 font-semibold">Client Enterprise</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Order Value</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status</th>
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
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#13110F] tabular-nums">
                          {formatCurrency(po.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={isDelivered ? 'success' : isShipped ? 'info' : isPaid ? 'neutral' : 'warning'}
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
                              <CheckCircle2 className="w-3.5 h-3.5" /> Electronic POD Verified
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
          SECTION: PAYMENTS & TRANSACTIONS
         ========================================================================= */}
      {activeTab === 'payments' && (
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
          SECTION: PERFORMANCE ANALYTICS
         ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Fulfillment SLA Rate</span>
              <p className="text-2xl font-bold text-[#3E5C31] mt-1 font-mono">98.4%</p>
              <span className="text-[10px] text-emerald-700 font-medium">Above benchmark</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">RFQ Quotation Win Rate</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">87.5%</p>
              <span className="text-[10px] text-[#6B6560]">7 accepted / 8 quoted</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Average Dispatch Velocity</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">2.4 days</p>
              <span className="text-[10px] text-emerald-700 font-medium">Standard 3-day target</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Quality Audit Score</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">95.0%</p>
              <span className="text-[10px] text-emerald-700 font-medium">ISO 9001 certified</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: OVERVIEW TAB CONTENT (RECENT ORDERS, RFQS, INVENTORY SNAPSHOT)
         ========================================================================= */}
      {activeTab === 'overview' && (
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

          {/* Pending RFQs snapshot */}
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

          {/* Product Listings Snapshot */}
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

          {/* Settlements snapshot */}
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
        </div>
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
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                      GST (18%)
                    </label>
                    <input
                      type="number"
                      value={quoteTax}
                      onChange={e => setQuoteTax(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                      Freight & Packaging
                    </label>
                    <input
                      type="number"
                      value={quoteShipping}
                      onChange={e => setQuoteShipping(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex justify-between items-center">
                  <span className="font-semibold text-[#13110F]">Final Total Quotation:</span>
                  <span className="font-mono font-bold text-base text-[#13110F]">
                    {formatCurrency(quotePrice + quoteTax + quoteShipping)}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                    Committed Delivery Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={quoteDeliveryDays}
                    onChange={e => setQuoteDeliveryDays(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                    Terms & Notes for Buyer
                  </label>
                  <textarea
                    value={quoteNotes}
                    onChange={e => setQuoteNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[rgba(19,17,15,0.08)]">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuotingRfq(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={isSubmittingQuote}>
                    {isSubmittingQuote ? 'Submitting...' : 'Confirm & Submit Quote'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: EDIT LISTING PRICING & TERMS
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
                <div>
                  <h3 className="text-sm font-bold text-[#13110F]">Update Listing Commercials</h3>
                  <p className="text-[11px] text-[#8C847D]">{editingListing.product?.name}</p>
                </div>
                <button onClick={() => setEditingListing(null)} className="p-1 rounded-lg text-[#8C847D] hover:text-[#13110F]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveListing} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                    Contracted Unit Price (₹)
                  </label>
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
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                      Min Order Qty (MOQ)
                    </label>
                    <input
                      type="number"
                      value={editMoq}
                      onChange={e => setEditMoq(Number(e.target.value))}
                      min={1}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#13110F] block mb-1">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      value={editLeadTime}
                      onChange={e => setEditLeadTime(Number(e.target.value))}
                      min={1}
                      className="w-full p-2.5 rounded-xl border border-[rgba(19,17,15,0.15)] font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[rgba(19,17,15,0.08)]">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingListing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Commercial Terms
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

export default SupplierDashboard;
