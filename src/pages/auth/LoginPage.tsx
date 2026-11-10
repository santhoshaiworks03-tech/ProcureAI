import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
      'Platform GMV oversight (₹1,24,50,000 settled volume)'
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
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync email when role changes
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(ROLE_PORTALS[role].userProfile.email);
    setPassword('••••••••••••');
    setErrorMessage(null);
  };

  const currentConfig = ROLE_PORTALS[selectedRole];
  const redirectTarget = searchParams.get('redirect') || '/';

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter a valid business email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Simulated authentic authentication handshake
    setTimeout(() => {
      store.login(selectedRole, email.trim());
      setIsSubmitting(false);
      navigate(redirectTarget, { replace: true });
    }, 250);
  };

  const handleDirectDemoLogin = (role: UserRole) => {
    const config = ROLE_PORTALS[role];
    setIsSubmitting(true);
    setSelectedRole(role);
    setEmail(config.userProfile.email);

    setTimeout(() => {
      store.login(role, config.userProfile.email);
      setIsSubmitting(false);
      navigate(redirectTarget, { replace: true });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#F4EEE6] text-[#13110F] flex flex-col justify-between font-sans selection:bg-[#F2C8A8] selection:text-[#13110F]">
      {/* Top Brand Header */}
      <header className="bg-[#F4EEE6]/85 backdrop-blur-xl border-b border-[rgba(19,17,15,0.08)] px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F2C8A8] text-[#13110F] flex items-center justify-center font-bold text-sm shadow-sm">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#13110F]">ProcureAI</span>
              <span className="text-[10px] font-mono text-[#6B6560] bg-[#EDE6DC] px-1.5 py-0.5 rounded border border-[rgba(19,17,15,0.08)]">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-[#6B6560] hidden sm:block">
              Autonomous AI Procurement & PayPal Orders v2 Settlement Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE6DC] border border-[rgba(19,17,15,0.08)] text-[#13110F] text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E5C31]"></span>
            <span>PayPal Sandbox Orders API v2</span>
          </div>

          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            target="_blank"
            rel="noreferrer"
            className="text-[#6B6560] hover:text-[#13110F] text-xs flex items-center gap-1 transition-colors"
          >
            Developer Sandbox <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Authentication Workspace */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-4xl space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <Badge variant="neutral" size="sm" className="bg-[#EDE6DC] text-[#13110F] border-[rgba(19,17,15,0.08)]">
              Role-Based Multi-Portal Authentication
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#13110F]">
              Sign In to Your ProcureAI Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6560] max-w-xl mx-auto">
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
                  className={`text-left p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-3 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-white border-[#13110F] ring-2 ring-[#13110F] shadow-md'
                      : 'bg-white/80 border-[rgba(19,17,15,0.08)] hover:border-[rgba(19,17,15,0.2)] hover:bg-white text-[#6B6560]'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-semibold ${
                        isSelected
                          ? 'bg-[#13110F] text-[#FAF7F2]'
                          : 'bg-[#EDE6DC] text-[#13110F]'
                      }`}>
                        {r === 'buyer' && <Building2 className="w-4 h-4" />}
                        {r === 'supplier' && <Truck className="w-4 h-4" />}
                        {r === 'admin' && <ShieldCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-[#13110F] text-xs">{cfg.shortName}</p>
                        <p className="text-[10px] text-[#6B6560] truncate max-w-[150px]">{cfg.entityName}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#13110F] flex-shrink-0" />
                    )}
                  </div>

                  <div className="pt-2 border-t border-[rgba(19,17,15,0.06)] flex items-center justify-between text-[11px]">
                    <span className="text-[#6B6560] truncate">{cfg.userProfile.name}</span>
                    <Badge variant={cfg.badgeVariant} size="sm">
                      {r}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Portal Sign-In Card */}
          <div className="bg-white border border-[rgba(19,17,15,0.08)] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            {/* Active Portal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[rgba(19,17,15,0.08)] pb-5">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentConfig.userProfile.avatar}
                  alt={currentConfig.userProfile.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[rgba(19,17,15,0.1)] shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#13110F]">{currentConfig.portalName}</h2>
                    <Badge variant={currentConfig.badgeVariant} size="sm">
                      {currentConfig.badgeLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6B6560] mt-0.5">
                    {currentConfig.userProfile.name} • {currentConfig.userProfile.title}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono text-[#8C847D] block uppercase tracking-wider">Authenticated Entity</span>
                <span className="text-xs font-semibold text-[#13110F]">{currentConfig.entityName}</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form & Capabilities Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form */}
              <form onSubmit={handleSignIn} className="lg:col-span-7 space-y-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#13110F] flex items-center justify-between">
                    <span>Authorized business email</span>
                    <span className="text-[10px] text-[#8C847D]">Auto-filled demo account</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C847D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-xl text-xs text-[#13110F] placeholder-[#8C847D] focus:outline-none focus:ring-1 focus:ring-[#13110F] focus:border-[#13110F] font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-[#13110F]">Workstation password</label>
                    <span className="text-[10px] text-[#8C847D]">Pre-configured sandbox</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C847D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-[#FAF7F2] border border-[rgba(19,17,15,0.12)] rounded-xl text-xs text-[#13110F] placeholder-[#8C847D] focus:outline-none focus:ring-1 focus:ring-[#13110F] focus:border-[#13110F] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C847D] hover:text-[#13110F]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Options */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#6B6560] select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded bg-[#FAF7F2] border-[rgba(19,17,15,0.2)] text-[#13110F] focus:ring-0"
                    />
                    <span>Remember workstation session</span>
                  </label>
                  <span className="text-[11px] text-[#8C847D]">
                    Supabase PostgreSQL RLS
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all rounded-xl"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        Authenticating {currentConfig.shortName}...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Sign In to {currentConfig.shortName} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>

              {/* Right Column: Portal Scope Highlights */}
              <div className="lg:col-span-5 bg-[#FAF7F2] p-5 rounded-2xl border border-[rgba(19,17,15,0.08)] space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#13110F]" />
                    <h3 className="text-xs font-semibold text-[#13110F]">Portal scope & authorizations</h3>
                  </div>

                  <p className="text-[11px] text-[#6B6560] leading-relaxed">
                    {currentConfig.portalSummary}
                  </p>

                  <ul className="space-y-2 text-[11px] text-[#13110F]">
                    {currentConfig.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3E5C31] flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[rgba(19,17,15,0.08)] text-[10px] text-[#6B6560] flex items-center justify-between">
                  <span>Audit Trail & Governance</span>
                  <span className="font-semibold text-[#3E5C31]">Verified & Protected</span>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Demo Login Bar */}
            <div className="pt-4 border-t border-[rgba(19,17,15,0.08)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#6B6560] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#13110F]" />
                  Instant 1-Click Evaluation Sign In (No typing required)
                </span>
                <span className="text-[10px] text-[#8C847D]">Hackathon Judges & Evaluators</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('buyer')}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.08)] hover:border-[#13110F] hover:bg-white text-left text-xs transition-colors flex items-center justify-between group shadow-xs"
                >
                  <div>
                    <span className="font-semibold text-[#13110F] group-hover:text-[#13110F] block text-[11px]">
                      🏢 1-Click: Priya Sharma
                    </span>
                    <span className="text-[10px] text-[#6B6560]">Buyer · Apex Tech</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#8C847D] group-hover:text-[#13110F]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('supplier')}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.08)] hover:border-[#13110F] hover:bg-white text-left text-xs transition-colors flex items-center justify-between group shadow-xs"
                >
                  <div>
                    <span className="font-semibold text-[#13110F] group-hover:text-[#13110F] block text-[11px]">
                      🏭 1-Click: Vikramaditya
                    </span>
                    <span className="text-[10px] text-[#6B6560]">Supplier · OmniOffice</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#8C847D] group-hover:text-[#13110F]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('admin')}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[rgba(19,17,15,0.08)] hover:border-[#13110F] hover:bg-white text-left text-xs transition-colors flex items-center justify-between group shadow-xs"
                >
                  <div>
                    <span className="font-semibold text-[#13110F] group-hover:text-[#13110F] block text-[11px]">
                      🛡️ 1-Click: Aditi Deshmukh
                    </span>
                    <span className="text-[10px] text-[#6B6560]">Admin · ProcureAI Root</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#8C847D] group-hover:text-[#13110F]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust & Architecture Footer */}
      <footer className="border-t border-[rgba(19,17,15,0.08)] bg-white px-6 sm:px-10 py-4 text-xs text-[#6B6560] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[11px]">
          <span>© 2026 ProcureAI</span>
          <span>•</span>
          <span>PayPal AI Hackathon 2026</span>
          <span>•</span>
          <span>Enterprise Edition</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] text-[#8C847D]">
          <span className="flex items-center gap-1 text-[#3E5C31]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E5C31]"></span>
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
