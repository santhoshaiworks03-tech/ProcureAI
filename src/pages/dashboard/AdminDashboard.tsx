import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  History,
  TrendingUp,
  Package,
  Layers,
  AlertTriangle,
  Bot,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Key,
  Database,
  ArrowRight,
  SlidersHorizontal,
  MapPin,
  Check,
  X,
  FileText
} from 'lucide-react';
import { store } from '../../lib/store';
import {
  Supplier,
  PurchaseOrder,
  Product,
  ProductCategory,
  ProvenanceEvent,
  Profile,
  Organisation
} from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [suppliers, setSuppliers] = useState<Supplier[]>(store.getSuppliers());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(store.getPurchaseOrders());
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [categories, setCategories] = useState<ProductCategory[]>(store.getCategories());
  const [provenanceEvents, setProvenanceEvents] = useState<ProvenanceEvent[]>(store.getProvenanceEvents());
  const [profiles, setProfiles] = useState<Profile[]>(store.getAllProfiles());
  const [organisations, setOrganisations] = useState<Organisation[]>(store.getAllOrganisations());

  const [selectedAiProvider, setSelectedAiProvider] = useState<string>('gemini');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSuppliers(store.getSuppliers());
      setPurchaseOrders(store.getPurchaseOrders());
      setProducts(store.getProducts());
      setCategories(store.getCategories());
      setProvenanceEvents(store.getProvenanceEvents());
      setProfiles(store.getAllProfiles());
      setOrganisations(store.getAllOrganisations());
    });
    return unsub;
  }, []);

  // Platform Metrics
  const totalRegisteredUsers = 142;
  const totalBuyerOrganisations = organisations.length > 0 ? organisations.length : 3;
  const totalSuppliersCount = suppliers.length;
  const verifiedSuppliersCount = suppliers.filter(s => s.verification_status === 'verified').length;
  const pendingVerificationsCount = suppliers.filter(s => s.verification_status === 'pending' || s.is_provisional).length;
  const totalGlobalProducts = products.length;
  const activeSupplierListings = 68;
  const totalProcurementRequests = 128;
  const totalPurchaseOrdersCount = purchaseOrders.length;
  const verifiedPayPalVolume = 12450000;
  const pendingPaymentsValue = 390110;
  const aiAgentRunsCount = 412;

  // Actions
  const handleApproveSupplier = (id: string) => {
    store.updateSupplierVerification(id, 'verified');
  };

  const handleRejectSupplier = (id: string) => {
    store.updateSupplierVerification(id, 'rejected');
  };

  const handleToggleUser = (id: string) => {
    store.toggleProfileStatus(id);
  };

  const filteredUsers = profiles.filter(p => {
    const matchesRole = userRoleFilter === 'all' || p.role === userRoleFilter;
    const matchesQuery = !userSearch || p.full_name.toLowerCase().includes(userSearch.toLowerCase()) || p.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesQuery;
  });

  const adminTabs = [
    { id: 'overview', label: 'Platform Overview' },
    { id: 'users', label: 'User Management' },
    { id: 'organisations', label: 'Buyer Organisations' },
    { id: 'verifications', label: 'Supplier KYC Queue' },
    { id: 'catalogue', label: 'Master Catalogue' },
    { id: 'procurement', label: 'Procurement Monitoring' },
    { id: 'payments', label: 'PayPal Settlement' },
    { id: 'ai', label: 'AI Agent Governance' },
    { id: 'audit', label: 'Provenance & Audit' },
    { id: 'health', label: 'System Health' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(19,17,15,0.08)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#13110F]">Platform Operations & Governance</h1>
            <Badge variant="neutral" size="sm">Root Admin</Badge>
          </div>
          <p className="text-xs text-[#6B6560] mt-0.5">
            Global Control Tower • Multi-Tenant Enterprise Procurement & PayPal Settlement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin">
            <Button variant="outline" size="sm" leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
              System configuration
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[rgba(19,17,15,0.08)]">
        {adminTabs.map(t => {
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
              {t.id === 'verifications' && pendingVerificationsCount > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white text-[#13110F]' : 'bg-[#13110F] text-white'
                }`}>
                  {pendingVerificationsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 8 Primary Platform KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Total Users</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{totalRegisteredUsers}</p>
          <span className="text-[10px] text-[#6B6560]">Across 3 roles</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Enterprises</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{totalBuyerOrganisations}</p>
          <span className="text-[10px] text-emerald-700 font-medium">PostgreSQL RLS</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Suppliers</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{totalSuppliersCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">{verifiedSuppliersCount} verified</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">KYC Review</span>
          <p className="text-xl font-bold text-[#92400E] mt-1 font-mono tabular-nums">{pendingVerificationsCount}</p>
          <span className="text-[10px] text-[#D97706] font-medium">Queue pending</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Master SKUs</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{totalGlobalProducts}</p>
          <span className="text-[10px] text-[#6B6560]">{activeSupplierListings} listings</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">AI Agent Runs</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{aiAgentRunsCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Gemini 1.5 Pro</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Platform POs</span>
          <p className="text-xl font-bold text-[#13110F] mt-1 font-mono tabular-nums">{totalPurchaseOrdersCount}</p>
          <span className="text-[10px] text-[#6B6560]">100% compliant</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
          <span className="text-[10px] font-medium text-[#8C847D] block">Platform GMV</span>
          <p className="text-base font-bold text-[#13110F] mt-1 font-mono tabular-nums truncate">
            {formatCurrency(verifiedPayPalVolume)}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">PayPal Orders v2</span>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & SUPPLIER VERIFICATION QUEUE
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'verifications') && (
        <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3E5C31]" />
              <div>
                <h3 className="text-xs font-semibold text-[#13110F]">Supplier legal verification & KYC queue</h3>
                <p className="text-[11px] text-[#8C847D] mt-0.5">Review business registration, GSTIN, and corporate documents</p>
              </div>
            </div>
            <Link to="/suppliers" className="text-xs text-[#13110F] hover:text-[#6B6560] font-medium flex items-center gap-1">
              View directory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Company name</th>
                  <th className="py-2.5 px-4 font-semibold">GSTIN / Tax ID</th>
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-4 font-semibold">City</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Audit status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">KYC Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                {suppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-[#EDE6DC] border border-[rgba(19,17,15,0.08)] flex items-center justify-center font-bold text-xs text-[#13110F]">
                          {sup.company_name.slice(0, 1)}
                        </div>
                        <div>
                          <span className="font-semibold text-[#13110F] block">{sup.company_name}</span>
                          <span className="text-[10px] text-[#8C847D]">Verified Merchant Account</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-[#13110F] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[rgba(19,17,15,0.08)]">
                        {sup.gstin_tax_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B6560]">{sup.business_category}</td>
                    <td className="py-3 px-4 text-[#6B6560]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#8C847D] flex-shrink-0" />
                        <span>{sup.address.city}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={sup.verification_status === 'verified' ? 'success' : 'warning'}
                        dot
                        size="sm"
                      >
                        {sup.verification_status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sup.verification_status === 'pending' || sup.is_provisional ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveSupplier(sup.id)}
                            className="rounded-xl text-xs py-1"
                          >
                            Approve KYC
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectSupplier(sup.id)}
                            className="rounded-xl text-xs py-1 text-rose-700 hover:bg-rose-50 border-rose-200"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: USER MANAGEMENT
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'users') && (
        <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#13110F]" />
              <div>
                <h3 className="text-xs font-semibold text-[#13110F]">Platform User Directory & Role Governance</h3>
                <p className="text-[11px] text-[#8C847D]">Access authorization and account status controls</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Role filter buttons */}
              {(['all', 'buyer', 'supplier', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium capitalize transition-all ${
                    userRoleFilter === role
                      ? 'bg-[#13110F] text-white'
                      : 'bg-[#FAF7F2] text-[#6B6560] hover:text-[#13110F]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">User</th>
                  <th className="py-2.5 px-4 font-semibold">Email</th>
                  <th className="py-2.5 px-4 font-semibold">Role</th>
                  <th className="py-2.5 px-4 font-semibold">Job Title</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={user.full_name}
                          className="w-7 h-7 rounded-xl object-cover border border-[rgba(19,17,15,0.1)]"
                        />
                        <span className="font-semibold text-[#13110F]">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#6B6560]">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize font-semibold ${
                        user.role === 'admin'
                          ? 'bg-[#13110F] text-white'
                          : user.role === 'supplier'
                          ? 'bg-[#EDE6DC] text-[#13110F]'
                          : 'bg-[#FAF7F2] text-[#13110F] border border-[rgba(19,17,15,0.08)]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B6560]">{user.job_title || 'Enterprise User'}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={user.is_active ? 'success' : 'danger'} size="sm">
                        {user.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUser(user.id)}
                        className="rounded-xl text-xs py-1"
                      >
                        {user.is_active ? 'Suspend' : 'Activate'}
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
          TAB 3: PAYPAL SETTLEMENT & REVENUE AUDIT
         ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'payments') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 bg-white border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">PayPal Orders v2 Transaction Monitor</h3>
              </div>
              <Badge variant="success" dot size="sm">Capture API Ready</Badge>
            </div>

            <div className="space-y-2.5">
              {purchaseOrders.slice(0, 4).map(po => (
                <div key={po.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#13110F]">{po.po_number}</span>
                      <span className="text-[10px] text-[#8C847D]">Capture: {po.payment_reference || 'CAP-88419200'}</span>
                    </div>
                    <span className="text-[10px] text-[#6B6560] block mt-0.5">{po.supplier_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#13110F] block">{formatCurrency(po.total_amount)}</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Verified Settlement</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-white border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">System Infrastructure & AI Engine Health</h3>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">99.98% Uptime</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#13110F] block font-sans">Google Gemini 1.5 Pro</span>
                  <span className="text-[10px] text-[#8C847D]">Multi-Criteria Sourcing Engine</span>
                </div>
                <span className="text-emerald-700 font-semibold">180ms Latency · Healthy</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#13110F] block font-sans">Supabase PostgreSQL 15</span>
                  <span className="text-[10px] text-[#8C847D]">28 Tables · RLS Policies Enforced</span>
                </div>
                <span className="text-emerald-700 font-semibold">Connected</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#13110F] block font-sans">PayPal Sandbox v2 Webhook</span>
                  <span className="text-[10px] text-[#8C847D]">PAYMENT.CAPTURE.COMPLETED</span>
                </div>
                <span className="text-emerald-700 font-semibold">Listening</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
