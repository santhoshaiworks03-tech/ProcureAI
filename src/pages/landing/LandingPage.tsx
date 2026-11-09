import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Building2,
  ShieldCheck,
  CreditCard,
  History,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  Package,
  DollarSign,
  Activity,
  FileCheck
} from 'lucide-react';
import { store } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ProcurementWorkflowJourney } from '../../components/workflow/ProcurementWorkflowJourney';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'agent' | 'suppliers' | 'paypal' | 'provenance'>('agent');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">ProcureAI</span>
              <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                v2.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Platform Features</a>
          <a href="#workflow" className="hover:text-blue-600 transition-colors">Autonomous Journey</a>
          <a href="#suppliers" className="hover:text-blue-600 transition-colors">Supplier Intelligence</a>
          <a href="#security" className="hover:text-blue-600 transition-colors">PayPal & Security</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Start Procurement
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 sm:px-12 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>PayPal AI Hackathon 2026 Enterprise Edition</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
            Procurement, Powered by <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Intelligence</span>.
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Automate sourcing, discover trusted suppliers, optimise purchasing decisions and manage payments through one intelligent procurement platform.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 shadow-md shadow-blue-500/20 text-sm font-semibold"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Procurement
              </Button>
            </Link>

            <a href="#features" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 text-sm font-semibold"
              >
                Explore Platform
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              PayPal Orders API v2
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-600" />
              Google Gemini 1.5 Pro
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-violet-600" />
              Cryptographic SHA-256 Ledger
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-600" />
              Supabase PostgreSQL RLS
            </span>
          </div>
        </div>

        {/* Hero Interactive App Preview */}
        <div className="max-w-6xl mx-auto mt-14 rounded-2xl border border-slate-200/90 shadow-2xl bg-white p-2 sm:p-4 overflow-hidden">
          <div className="bg-slate-900 rounded-xl overflow-hidden text-white p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="ml-2 font-mono text-xs text-slate-400">procureai.enterprise/dashboard</span>
              </div>
              <Badge variant="success" dot size="sm">
                Sandbox Orders v2 Ready
              </Badge>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block font-medium">Platform GMV Volume</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono mt-1 block">₹1,24,50,000</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +14.2% AI savings
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block font-medium">Commercial Suppliers</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono mt-1 block">8 Vendors</span>
                <span className="text-[10px] text-slate-400 mt-1 block">100% KYC Verified</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block font-medium">Session Lock Protection</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono mt-1 block">300 Seconds</span>
                <span className="text-[10px] text-blue-400 mt-1 block">Zero Price Slippage</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block font-medium">Cryptographic Blocks</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono mt-1 block">#0001 - #0007</span>
                <span className="text-[10px] text-violet-400 mt-1 block">SHA-256 Chained</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autonomous Procurement Workflow Section */}
      <section id="workflow" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="neutral" size="sm">Connected Autonomous Pipeline</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The 8-Stage Procurement Journey
          </h2>
          <p className="text-sm text-slate-500">
            From natural language prompt parsing to instant PayPal Orders API v2 settlement and cryptographic ledger verification.
          </p>
        </div>

        <ProcurementWorkflowJourney currentActiveStage={6} interactive={true} />
      </section>

      {/* Core Platform Capabilities Section */}
      <section id="features" className="py-20 px-6 sm:px-12 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="neutral" size="sm">ProcureAI 2.0 Architecture</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Procurement Redefined
            </h2>
            <p className="text-sm text-slate-500">
              Four unified modules engineered for maximum efficiency, compliance, and instant settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hoverEffect className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Procurement Terminal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe equipment requirements conversationally. The agent extracts verified SKUs and matches database inventory.
              </p>
              <div className="pt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
                Gemini 1.5 Pro Integrated <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card hoverEffect className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Criteria Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tune algorithmic weights across Price, Availability, Lead Time, SLA, and ESG compliance with live recalculation.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                5-Factor Scoring Model <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card hoverEffect className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">PayPal Orders API v2</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                300-second price integrity sessions. Eliminates stale quotes and guarantees instant merchant payout capture.
              </p>
              <div className="pt-2 text-xs font-semibold text-amber-600 flex items-center gap-1">
                Time-Locked Settlement <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card hoverEffect className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Cryptographic Provenance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every PO, approval, and settlement is sequentially hashed with SHA-256 chaining into an immutable audit stream.
              </p>
              <div className="pt-2 text-xs font-semibold text-violet-600 flex items-center gap-1">
                Tamper-Evident Blocks <ArrowRight className="w-3 h-3" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & PayPal Section */}
      <section id="security" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white space-y-8 shadow-xl">
          <div className="max-w-2xl space-y-3">
            <Badge variant="default" className="bg-blue-600 text-white border-0">
              Fintech & PayPal Security Architecture
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Enterprise Control Meets Seamless Settlement
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              ProcureAI enforces strict human governance thresholds: agents draft purchase orders, but only authorized human managers can sign off on PayPal disbursements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Zero Client-Side Trust
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Payable amounts are bound cryptographically to approved purchase order hashes verified on the server.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <Clock className="w-4 h-4" /> 300-Second Expiry Window
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Locks supplier inventory and contracted prices against market fluctuations and currency swings.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                <Lock className="w-4 h-4" /> SHA-256 Provenance Audit
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each block contains previous hash, timestamp, actor identity, and verification reference PRC-VRF.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Ready to evaluate ProcureAI 2.0 with live PayPal Sandbox integration?
            </span>
            <Link to="/login">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Launch ProcureAI Application
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200/80 bg-white px-6 sm:px-12 py-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              P
            </div>
            <div>
              <span className="font-bold text-slate-900 block">ProcureAI 2.0</span>
              <span className="text-[11px] text-slate-400">PayPal AI Hackathon 2026 Production Submission</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-600 font-medium">
            <Link to="/login?role=buyer" className="hover:text-blue-600">Buyer Portal</Link>
            <Link to="/login?role=supplier" className="hover:text-blue-600">Supplier Portal</Link>
            <Link to="/login?role=admin" className="hover:text-blue-600">Admin Control Tower</Link>
            <a
              href="https://github.com/santhoshaiworks03-tech/ProcureAI"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 ProcureAI Inc. All rights reserved.</span>
          <span>Engineered with React 18, TypeScript, Tailwind CSS, Supabase RLS & PayPal Orders v2.</span>
        </div>
      </footer>
    </div>
  );
};

