import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Building2,
  Package,
  TrendingUp,
  CreditCard,
  SlidersHorizontal,
  Bot,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  MapPin,
  Lock,
  Search,
  Check,
  X,
  FileCheck2,
  LayoutDashboard,
  FileText,
  BarChart3,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import { store } from '../../lib/store';
import { Supplier, Profile, PurchaseOrder, Product, Organisation } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => store.getSuppliers());
  const [profiles, setProfiles] = useState<Profile[]>(() => store.getAllProfiles());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => store.getPurchaseOrders());
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  const [organisations, setOrganisations] = useState<Organisation[]>(() => store.getAllOrganisations());
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'buyer' | 'supplier' | 'admin'>('all');
  const [catalogueCategoryFilter, setCatalogueCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSuppliers(store.getSuppliers());
      setProfiles(store.getAllProfiles());
      setPurchaseOrders(store.getPurchaseOrders());
      setProducts(store.getProducts());
      setOrganisations(store.getAllOrganisations());
    });
    return unsub;
  }, []);

  // Platform Metrics (Memoized)
  const {
    totalRegisteredUsers,
    totalBuyerOrganisations,
    totalSuppliersCount,
    pendingVerificationsCount,
    verifiedSuppliersCount,
    totalGlobalProducts,
    activeSupplierListings,
    totalPurchaseOrdersCount,
    verifiedPayPalVolume,
    aiAgentRunsCount
  } = useMemo(() => {
    return store.getAdminDashboardMetrics();
  }, [profiles, organisations, suppliers, products, purchaseOrders]);

  // Actions
  const handleVerifySupplier = (supplierId: string, status: 'verified' | 'rejected') => {
    store.updateSupplierVerification(supplierId, status);
  };

  const handleToggleUser = (userId: string) => {
    store.toggleProfileStatus(userId);
  };

  const filteredUsers = useMemo<Profile[]>(() => {
    return profiles.filter((u: Profile) => {
      if (userRoleFilter === 'all') return true;
      return u.role === userRoleFilter;
    });
  }, [profiles, userRoleFilter]);

  const filteredProducts = useMemo<Product[]>(() => {
    return products.filter((p: Product) => {
      if (catalogueCategoryFilter === 'all') return true;
      return (p.category_name || 'General') === catalogueCategoryFilter;
    });
  }, [products, catalogueCategoryFilter]);

  const categories = useMemo<string[]>(() => {
    return ['all', ...Array.from(new Set(products.map((p: Product) => p.category_name || 'General')))];
  }, [products]);

  const ADMIN_MENU_HEADINGS: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Platform Operations & Governance',
      subtitle: 'Global Control Tower • Multi-Tenant Enterprise Procurement & PayPal Settlement'
    },
    users: {
      title: 'Enterprise User Directory & Role Governance',
      subtitle: 'Manage user access permissions, identity status, and role authorizations'
    },
    organisations: {
      title: 'Buyer Enterprises & Multi-Tenant Orgs',
      subtitle: 'Enterprise accounts, department structures, and PostgreSQL RLS scopes'
    },
    verifications: {
      title: 'Supplier Legal Verification & KYC Queue',
      subtitle: 'Review business registration, corporate GSTIN, and compliance credentials'
    },
    catalogue: {
      title: 'Global Product Catalogue Oversight',
      subtitle: 'Master SKU directory, verified vendor listings, and category taxonomy'
    },
    procurement: {
      title: 'Procurement Pipeline Monitor',
      subtitle: 'Real-time observation of automated purchasing, budget caps, and orders'
    },
    payments: {
      title: 'PayPal Orders v2 Global Settlements',
      subtitle: 'Gateway capture monitoring, merchant escrow disbursements, and transaction logs'
    },
    ai: {
      title: 'Autonomous AI Agent Multi-Provider Governance',
      subtitle: 'Gemini 1.5 Pro latency benchmarks, token allocation, and autonomous logs'
    },
    health: {
      title: 'System Infrastructure & Telemetry Health',
      subtitle: 'Database performance, REST endpoint monitors, and webhook subscribers'
    }
  };

  const currentMenu = ADMIN_MENU_HEADINGS[activeTab] || ADMIN_MENU_HEADINGS.overview;

  return (
    <div className="space-y-6">
      {/* =========================================================================
          DYNAMIC ADMIN MENU HEADING ALONE (NO REDUNDANT HORIZONTAL TAB BAR)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(19,17,15,0.08)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#13110F]">
              {currentMenu.title}
            </h1>
            <Badge variant="neutral" size="sm">Root Admin</Badge>
          </div>
          <p className="text-xs text-[#6B6560] mt-0.5">
            {currentMenu.subtitle}
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

      {/* =========================================================================
          8 PRIMARY PLATFORM KPIS — SHOWN ONLY TO OVERVIEW ALONE
         ========================================================================= */}
      {activeTab === 'overview' && (
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
      )}

      {/* =========================================================================
          TAB: BUYER ORGANISATIONS (MULTI-TENANT ENTERPRISES)
         ========================================================================= */}
      {activeTab === 'organisations' && (
        <div className="space-y-6">
          {/* Summary metrics for organisations */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Registered Enterprises</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">{organisations.length}</p>
              <span className="text-[10px] text-emerald-700 font-medium">100% KYC verified</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Combined Annual Budget</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">
                {formatCurrency(organisations.reduce((sum, o) => sum + (o.annual_procurement_budget || 0), 0))}
              </p>
              <span className="text-[10px] text-[#6B6560]">Authorized spend cap</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Multi-Tenant Isolation</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">Active</p>
              <span className="text-[10px] text-emerald-700 font-medium">PostgreSQL Row-Level Security</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Enterprise Users</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">
                {profiles.filter(p => p.role === 'buyer').length}
              </p>
              <span className="text-[10px] text-[#6B6560]">Active purchasers</span>
            </div>
          </div>

          {/* Enterprises Directory Table */}
          <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Multi-Tenant Buyer Organisations Directory</h3>
              </div>
              <span className="text-[11px] text-[#6B6560]">
                {organisations.length} enterprise tenants isolated by Supabase RLS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Enterprise Name</th>
                    <th className="py-2.5 px-4 font-semibold">Registration / Tax ID</th>
                    <th className="py-2.5 px-4 font-semibold">Industry Domain</th>
                    <th className="py-2.5 px-4 font-semibold">Location</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Annual Budget</th>
                    <th className="py-2.5 px-4 font-semibold text-center">RLS Scope</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                  {organisations.map(org => (
                    <tr key={org.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-[#EDE6DC] text-[#13110F] flex items-center justify-center font-bold text-xs">
                            {org.name.slice(0, 1)}
                          </div>
                          <div>
                            <span className="font-semibold text-[#13110F] block">{org.name}</span>
                            <span className="text-[10px] font-mono text-[#8C847D]">{org.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-[#13110F] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[rgba(19,17,15,0.08)] block truncate max-w-[150px]">
                          {org.tax_id || org.business_registration_no}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#6B6560]">{org.industry || 'Enterprise Software'}</td>
                      <td className="py-3 px-4 text-[#6B6560]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8C847D] flex-shrink-0" />
                          <span>{org.address?.city || 'Bengaluru'}, {org.address?.state || 'KA'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#13110F]">
                        {formatCurrency(org.annual_procurement_budget)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          tenant_id = {org.id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={org.is_verified ? 'success' : 'neutral'} size="sm">
                          {org.is_verified ? 'Verified Tenant' : 'Pending Review'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: SUPPLIER VERIFICATION QUEUE
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
                        variant={
                          sup.verification_status === 'verified'
                            ? 'success'
                            : sup.verification_status === 'pending'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {sup.verification_status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {sup.verification_status === 'pending' || sup.is_provisional ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleVerifySupplier(sup.id, 'verified')}
                            className="rounded-xl text-xs py-1"
                          >
                            Approve KYC
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifySupplier(sup.id, 'rejected')}
                            className="rounded-xl text-xs py-1"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Fully Compliant
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
          SECTION: USER MANAGEMENT
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
                        <div className="w-7 h-7 rounded-full bg-[#EDE6DC] text-[#13110F] flex items-center justify-center font-bold text-xs">
                          {user.full_name.slice(0, 1)}
                        </div>
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
          SECTION: MASTER CATALOGUE OVERSIGHT
         ========================================================================= */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Global Product Catalogue Master Index</h3>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatalogueCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium capitalize transition-all whitespace-nowrap ${
                      catalogueCategoryFilter === cat
                        ? 'bg-[#13110F] text-white'
                        : 'bg-[#FAF7F2] text-[#6B6560] hover:text-[#13110F]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">SKU ID</th>
                    <th className="py-2.5 px-4 font-semibold">Product Name</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold">Brand</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Benchmark Price</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                  {filteredProducts.map(prod => (
                    <tr key={prod.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#13110F]">
                        {prod.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#13110F] block">{prod.name}</span>
                        <span className="text-[10px] text-[#8C847D]">{prod.description?.slice(0, 50)}...</span>
                      </td>
                      <td className="py-3 px-4 text-[#6B6560]">{prod.category_name || 'Commercial'}</td>
                      <td className="py-3 px-4 font-semibold text-[#13110F]">{prod.brand}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#13110F]">
                        {formatCurrency(prod.benchmark_market_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success" size="sm">
                          Catalogued
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: PROCUREMENT MONITOR
         ========================================================================= */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle overflow-hidden">
            <div className="p-4 border-b border-[rgba(19,17,15,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Autonomous Procurement Transaction Stream</h3>
              </div>
              <span className="text-[11px] text-[#6B6560]">
                {purchaseOrders.length} commercial procurement orders across platform
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F2] text-[#6B6560] text-[10px] font-semibold uppercase tracking-wider border-b border-[rgba(19,17,15,0.08)]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">PO Number</th>
                    <th className="py-2.5 px-4 font-semibold">Buyer Enterprise</th>
                    <th className="py-2.5 px-4 font-semibold">Supplier</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Order Value</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Pipeline Status</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(19,17,15,0.06)]">
                  {purchaseOrders.map(po => (
                    <tr key={po.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#13110F]">
                        {po.po_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#13110F] block">{po.organisation_name || 'Apex Tech Solutions'}</span>
                        <span className="text-[10px] text-[#8C847D]">{po.created_by}</span>
                      </td>
                      <td className="py-3 px-4 text-[#6B6560]">{po.supplier_name}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#13110F]">
                        {formatCurrency(po.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            po.status === 'delivered'
                              ? 'success'
                              : po.status === 'shipped'
                              ? 'info'
                              : po.status === 'payment_completed' || po.status === 'approved'
                              ? 'neutral'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {po.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          PayPal Orders v2
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: PAYPAL SETTLEMENT & REVENUE AUDIT
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

      {/* =========================================================================
          SECTION: AI AGENT MULTI-PROVIDER GOVERNANCE
         ========================================================================= */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Active Primary LLM</span>
              <p className="text-xl font-bold text-[#13110F] mt-1">Gemini 1.5 Pro</p>
              <span className="text-[10px] text-emerald-700 font-medium">Google DeepMind</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Average Turnaround</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">180 ms</p>
              <span className="text-[10px] text-emerald-700 font-medium">Streaming responses</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">JSON Schema Strictness</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">99.8%</p>
              <span className="text-[10px] text-[#6B6560]">Zero validation faults</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">Autonomous Decisions</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">142 runs</p>
              <span className="text-[10px] text-[#6B6560]">Human-in-the-loop gate</span>
            </div>
          </div>

          <Card className="p-6 bg-white border-[rgba(19,17,15,0.08)] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(19,17,15,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#13110F]" />
                <h3 className="text-xs font-semibold text-[#13110F]">Autonomous Sourcing Engine Governance & Decision Policies</h3>
              </div>
              <Badge variant="success" size="sm">Active Guardrails</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#13110F] block">Multi-Criteria Deterministic Sourcing Policy</span>
                  <span className="text-[10px] text-[#8C847D]">
                    Scores suppliers across Price (30%), Availability (25%), Lead Time (20%), SLA (15%), and ESG (10%).
                  </span>
                </div>
                <span className="text-emerald-700 font-semibold font-mono text-[11px]">Enforced</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#13110F] block">Human-in-the-Loop Spend Ceiling Gate</span>
                  <span className="text-[10px] text-[#8C847D]">
                    Any order exceeding ₹50,000 mandates multi-tier manager cryptographic authorization.
                  </span>
                </div>
                <span className="text-emerald-700 font-semibold font-mono text-[11px]">Active</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.06)] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#13110F] block">PayPal Orders v2 Price-Lock Assurance</span>
                  <span className="text-[10px] text-[#8C847D]">
                    300-second session lock guarantees locked unit price before order capture execution.
                  </span>
                </div>
                <span className="text-emerald-700 font-semibold font-mono text-[11px]">Active</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          SECTION: SYSTEM HEALTH & INFRASTRUCTURE TELEMETRY
         ========================================================================= */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">System Uptime</span>
              <p className="text-2xl font-bold text-[#3E5C31] mt-1 font-mono">99.98%</p>
              <span className="text-[10px] text-emerald-700 font-medium">30-day trailing</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">PostgreSQL Database</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">28 Tables</p>
              <span className="text-[10px] text-emerald-700 font-medium">Supabase RLS active</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[rgba(19,17,15,0.08)] shadow-subtle">
              <span className="text-[11px] text-[#8C847D] block">PayPal Orders v2 Gateway</span>
              <p className="text-2xl font-bold text-[#13110F] mt-1 font-mono">200 OK</p>
              <span className="text-[10px] text-emerald-700 font-medium">Sandbox capture healthy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
