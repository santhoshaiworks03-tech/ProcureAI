import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserCheck,
  KeyRound,
  ExternalLink,
  Sparkles,
  Bot,
  CreditCard,
  Layers,
  Activity
} from 'lucide-react';
import { store } from '../../lib/store';
import { UserRole } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';

interface RolePortalConfig {
  role: UserRole;
  portalName: string;
  shortName: string;
  entityName: string;
  badgeLabel: string;
  badgeVariant: 'neutral' | 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'provisional';
  userProfile: {
    name: string;
    email: string;
    title: string;
    avatar: string;
  };
  accentColor: string;
  portalSummary: string;
  capabilities: string[];
}

const ROLE_PORTALS: Record<UserRole, RolePortalConfig> = {
  buyer: {
    role: 'buyer',
    portalName: 'Enterprise Buyer Portal',
    shortName: 'Buyer Portal',
    entityName: 'Apex Tech Solutions Pvt Ltd',
    badgeLabel: 'Verified Enterprise',
    badgeVariant: 'success',
    userProfile: {
      name: 'Priya Sharma',
      email: 'priya.sharma@apextech.com',
      title: 'Head of Strategic Procurement',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    accentColor: 'charcoal',
    portalSummary: 'Autonomous procurement agent, multi-supplier catalogue negotiation, budget threshold approvals, and 5-min time-locked PayPal checkout.',
    capabilities: [
      'Natural language AI procurement agent (Google Gemini 1.5 Pro)',
      'Algorithmic 5-dimension supplier scoring matrix',
      'Dual-view catalogue with AG Grid Community',
      'Time-locked (300s) PayPal Orders API v2 settlement'
    ]
  },
  supplier: {
    role: 'supplier',
    portalName: 'Supplier Fulfillment Portal',
    shortName: 'Supplier Portal',
    entityName: 'OmniOffice Direct Ltd',
    badgeLabel: 'Verified Supplier Partner',
    badgeVariant: 'neutral',
    userProfile: {
      name: 'Vikramaditya Mehta',
      email: 'vikram@omniofficedirect.com',
      title: 'Commercial Director & Partner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    accentColor: 'sage',
    portalSummary: 'Incoming purchase order fulfillment, real-time stock replenishment, delivery tracking, and PayPal merchant gateway settlements.',
    capabilities: [
      'Interactive purchase order fulfillment & dispatch pipeline',
      'Instant catalogue stock replenishment (+25 stock controls)',
      'PayPal Merchant Account integration & automated payouts',
      '98.4% on-time delivery & SLA performance rating'
    ]
  },
  admin: {
    role: 'admin',
    portalName: 'Platform Operations & Governance Portal',
    shortName: 'Admin Control Tower',
    entityName: 'ProcureAI Global Operations',
    badgeLabel: 'Root Administrator',
    badgeVariant: 'neutral',
    userProfile: {
      name: 'Aditi Deshmukh',
      email: 'aditi.admin@procureai.io',
      title: 'Platform Chief Architect & Root Administrator',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    accentColor: 'charcoal',
    portalSummary: 'Multi-tenant control tower, supplier legal KYC and compliance review, immutable audit ledger, and AI multi-provider configuration.',
    capabilities: [
      'Supplier legal KYC, GSTIN & corporate tax ID verification queue',
      'Complete compliance audit trail & governance log',
      'Supabase PostgreSQL 28-table RLS health monitor',
      `Platform GMV oversight (${formatCurrency(12450000)} settled volume)`
    ]
  }
};

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial role from query param ?role=buyer|supplier|admin
  const initialRoleParam = searchParams.get('role') as UserRole;
  const validInitialRole = (initialRoleParam && ['buyer', 'supplier', 'admin'].includes(initialRoleParam))
    ? initialRoleParam
    : 'buyer';

  const [selectedRole, setSelectedRole] = useState<UserRole>(validInitialRole);
  const [email, setEmail] = useState<string>(ROLE_PORTALS[validInitialRole].userProfile.email);
  const [password, setPassword] = useState<string>('ProcureAI@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync email when role changes
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(ROLE_PORTALS[role].userProfile.email);
    setPassword('ProcureAI@2026');
    setErrorMessage(null);
  };

  const currentConfig = ROLE_PORTALS[selectedRole];
  const redirectTarget = searchParams.get('redirect') || '/';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter a valid business email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Please enter a valid password (minimum 6 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await store.loginWithCredentials(email.trim(), password);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
        return;
      }

      const targetDashboard = store.getDashboardPath(result.role);
      const isCustomRedirect = redirectTarget && redirectTarget !== '/' && redirectTarget !== '/dashboard';
      navigate(isCustomRedirect ? redirectTarget : targetDashboard, { replace: true });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'An authentication error occurred.');
    }
  };

  const handleDirectDemoLogin = async (role: UserRole) => {
    const config = ROLE_PORTALS[role];
    setIsSubmitting(true);
    setSelectedRole(role);
    setEmail(config.userProfile.email);
    setPassword('ProcureAI@2026');

    try {
      const result = await store.loginWithCredentials(config.userProfile.email, 'ProcureAI@2026');
      setIsSubmitting(false);

      if (result.success) {
        navigate(store.getDashboardPath(result.role), { replace: true });
      } else {
        const fallbackRole = store.login(role, config.userProfile.email);
        navigate(store.getDashboardPath(fallbackRole), { replace: true });
      }
    } catch {
      const fallbackRole = store.login(role, config.userProfile.email);
      setIsSubmitting(false);
      navigate(store.getDashboardPath(fallbackRole), { replace: true });
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between font-sans selection:bg-[#F2C8A8] selection:text-[#13110F] bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url('/login-bg.jpg')` }}
    >
      {/* Cinematic Ambient Dark Vignette Overlay for Crisp Readability & Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C0E]/80 via-[#0B0C0E]/70 to-[#0B0C0E]/90 backdrop-blur-[2px] -z-10 pointer-events-none" />

      {/* Top Brand Header */}
      <header className="bg-[#0B0C0E]/80 backdrop-blur-xl border-b border-white/10 px-6 sm:px-10 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/procureai-logo.png"
              alt="ProcureAI"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-[10px] font-mono text-[#F2C8A8] bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
              v2.0
            </span>
          </Link>
          <span className="text-[11px] text-[#EDE6DC]/70 hidden md:inline-block border-l border-white/15 pl-3">
            Autonomous AI Procurement & PayPal Orders v2 Settlement Platform
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#FAF7F2] text-[11px] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B4C7A6] animate-pulse"></span>
            <span>PayPal Sandbox Orders API v2</span>
          </div>

          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            target="_blank"
            rel="noreferrer"
            className="text-[#EDE6DC]/75 hover:text-white text-xs flex items-center gap-1 transition-colors"
          >
            Developer Sandbox <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Authentication Workspace */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 sm:py-6 z-10">
        <div className="w-full max-w-4xl space-y-4">
          {/* Welcome Text */}
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[#F2C8A8] border border-white/15 text-[11px] font-semibold shadow-sm">
              <Sparkles className="w-3 h-3 text-[#F2C8A8]" />
              Role-Based Multi-Portal Authentication
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF7F2] drop-shadow-sm">
              Sign In to Your ProcureAI Portal
            </h1>
            <p className="text-xs text-[#EDE6DC]/85 max-w-xl mx-auto leading-relaxed">
              Select your organization role below to access your tailored procurement terminal, supplier fulfillment hub, or platform governance control tower.
            </p>
          </div>

          {/* Three Role Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['buyer', 'supplier', 'admin'] as UserRole[]).map(r => {
              const cfg = ROLE_PORTALS[r];
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSelectRole(r)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-200 text-xs flex flex-col justify-between gap-2.5 hover:-translate-y-1 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#1C1916]/95 backdrop-blur-2xl border-[#F2C8A8] ring-2 ring-[#F2C8A8]/60 text-white shadow-2xl shadow-black/60 -translate-y-0.5'
                      : 'bg-[#13110F]/75 backdrop-blur-xl border border-white/15 hover:border-white/30 hover:bg-[#13110F]/90 text-[#EDE6DC] shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold shadow-sm ${
                        isSelected
                          ? 'bg-[#F2C8A8] text-[#13110F]'
                          : 'bg-white/10 text-white border border-white/15'
                      }`}>
                        {r === 'buyer' && <Building2 className="w-3.5 h-3.5" />}
                        {r === 'supplier' && <Truck className="w-3.5 h-3.5" />}
                        {r === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="font-bold text-[#FAF7F2] text-xs">{cfg.shortName}</p>
                        <p className="text-[10px] text-[#EDE6DC]/70 truncate max-w-[150px]">{cfg.entityName}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#F2C8A8] flex-shrink-0" />
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-[#EDE6DC]/75 truncate">{cfg.userProfile.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                      isSelected
                        ? 'bg-[#F2C8A8] text-[#13110F] font-bold'
                        : 'bg-white/10 text-[#EDE6DC] border border-white/10'
                    }`}>
                      {r}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Portal Sign-In Card */}
          <div className="bg-[#13110F]/85 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 text-[#FAF7F2]">
            {/* Active Portal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentConfig.userProfile.avatar}
                  alt={currentConfig.userProfile.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#F2C8A8]/60 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#FAF7F2]">{currentConfig.portalName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#B4C7A6]/20 text-[#B4C7A6] border border-[#B4C7A6]/40">
                      {currentConfig.badgeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#EDE6DC]/75 mt-0.5">
                    {currentConfig.userProfile.name} • {currentConfig.userProfile.title}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono text-[#EDE6DC]/60 block uppercase tracking-wider">Authenticated Entity</span>
                <span className="text-xs font-semibold text-[#FAF7F2]">{currentConfig.entityName}</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form & Capabilities Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form */}
              <form onSubmit={handleSignIn} className="lg:col-span-7 space-y-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#FAF7F2] flex items-center justify-between">
                    <span>Authorized business email</span>
                    <span className="text-[10px] text-[#EDE6DC]/60">Auto-filled demo account</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#EDE6DC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1916]/85 border border-white/15 rounded-xl text-xs text-[#FAF7F2] placeholder-[#EDE6DC]/40 focus:outline-none focus:ring-1 focus:ring-[#F2C8A8] focus:border-[#F2C8A8] font-mono shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-[#FAF7F2]">Workstation password</label>
                    <span className="text-[10px] text-[#EDE6DC]/60">Pre-configured sandbox</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#EDE6DC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-[#1C1916]/85 border border-white/15 rounded-xl text-xs text-[#FAF7F2] placeholder-[#EDE6DC]/40 focus:outline-none focus:ring-1 focus:ring-[#F2C8A8] focus:border-[#F2C8A8] font-mono shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EDE6DC]/50 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Options */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#EDE6DC]/75 select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded bg-[#1C1916] border-white/20 text-[#F2C8A8] focus:ring-0"
                    />
                    <span>Remember workstation session</span>
                  </label>
                  <span className="text-[11px] text-[#EDE6DC]/60">
                    Supabase PostgreSQL RLS
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-[#F2C8A8] text-[#13110F] hover:bg-[#ebbe9c] text-xs font-bold rounded-xl active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-[#13110F]/30 border-t-[#13110F] rounded-full animate-spin"></span>
                        Authenticating {currentConfig.shortName}...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Sign In to {currentConfig.shortName} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Column: Portal Scope Highlights */}
              <div className="lg:col-span-5 bg-white/[0.04] backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#F2C8A8]" />
                    <h3 className="text-xs font-bold text-[#FAF7F2]">Portal scope & authorizations</h3>
                  </div>

                  <p className="text-[11px] text-[#EDE6DC]/75 leading-relaxed">
                    {currentConfig.portalSummary}
                  </p>

                  <ul className="space-y-2 text-[11px] text-[#FAF7F2]">
                    {currentConfig.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B4C7A6] flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-[#EDE6DC]/75 flex items-center justify-between">
                  <span>Audit Trail & Governance</span>
                  <span className="font-semibold text-[#B4C7A6]">Verified & Protected</span>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Demo Login Bar */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#EDE6DC]/85 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#F2C8A8]" />
                  Instant 1-Click Evaluation Sign In (No typing required)
                </span>
                <span className="text-[10px] text-[#EDE6DC]/60">Hackathon Judges & Evaluators</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('buyer')}
                  className="px-3 py-2 rounded-xl bg-[#1C1916]/85 border border-white/10 hover:border-[#F2C8A8] hover:bg-[#26221F] text-left text-xs transition-colors flex items-center justify-between group shadow-md"
                >
                  <div>
                    <span className="font-bold text-[#FAF7F2] group-hover:text-[#F2C8A8] block text-[11px] transition-colors">
                      🏢 1-Click: Priya Sharma
                    </span>
                    <span className="text-[10px] text-[#EDE6DC]/60">Buyer · Apex Tech</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#EDE6DC]/40 group-hover:text-[#F2C8A8] transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('supplier')}
                  className="px-3 py-2 rounded-xl bg-[#1C1916]/85 border border-white/10 hover:border-[#F2C8A8] hover:bg-[#26221F] text-left text-xs transition-colors flex items-center justify-between group shadow-md"
                >
                  <div>
                    <span className="font-bold text-[#FAF7F2] group-hover:text-[#F2C8A8] block text-[11px] transition-colors">
                      🏭 1-Click: Vikramaditya
                    </span>
                    <span className="text-[10px] text-[#EDE6DC]/60">Supplier · OmniOffice</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#EDE6DC]/40 group-hover:text-[#F2C8A8] transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('admin')}
                  className="px-3 py-2 rounded-xl bg-[#1C1916]/85 border border-white/10 hover:border-[#F2C8A8] hover:bg-[#26221F] text-left text-xs transition-colors flex items-center justify-between group shadow-md"
                >
                  <div>
                    <span className="font-bold text-[#FAF7F2] group-hover:text-[#F2C8A8] block text-[11px] transition-colors">
                      🛡️ 1-Click: Aditi Deshmukh
                    </span>
                    <span className="text-[10px] text-[#EDE6DC]/60">Admin · ProcureAI Root</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#EDE6DC]/40 group-hover:text-[#F2C8A8] transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust & Architecture Footer */}
      <footer className="bg-[#0B0C0E]/80 backdrop-blur-xl border-t border-white/10 px-6 sm:px-10 py-4 text-xs text-[#EDE6DC]/70 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-4 text-[11px]">
          <span>© 2026 ProcureAI</span>
          <span>•</span>
          <span>PayPal AI Hackathon 2026</span>
          <span>•</span>
          <span>Enterprise Edition</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] text-[#EDE6DC]/75">
          <span className="flex items-center gap-1 text-[#B4C7A6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B4C7A6]"></span>
            Supabase RLS Enforced
          </span>
          <span>•</span>
          <span>PayPal Orders API v2</span>
          <span>•</span>
          <span>Audit Provenance</span>
        </div>
      </footer>
    </div>
  );
};
