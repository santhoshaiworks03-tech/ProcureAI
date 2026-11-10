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
    <div className="min-h-screen bg-[#F4EEE6] text-[#13110F] font-sans selection:bg-[#F2C8A8] selection:text-[#13110F]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#F4EEE6]/85 backdrop-blur-xl border-b border-[rgba(19,17,15,0.08)] px-6 sm:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F2C8A8] text-[#13110F] flex items-center justify-center font-bold text-sm shadow-sm">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#13110F]">ProcureAI</span>
              <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                v2.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#6B6560]">
          <a href="#features" className="hover:text-[#13110F] transition-colors">Platform Features</a>
          <a href="#workflow" className="hover:text-[#13110F] transition-colors">Autonomous Journey</a>
          <a href="#suppliers" className="hover:text-[#13110F] transition-colors">Supplier Intelligence</a>
          <a href="#security" className="hover:text-[#13110F] transition-colors">PayPal & Security</a>
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
      <section className="relative overflow-hidden pt-16 pb-20 px-6 sm:px-12 bg-transparent border-b border-[rgba(19,17,15,0.08)]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE6DC] border border-[rgba(19,17,15,0.08)] text-[#13110F] text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#13110F]" />
            <span>PayPal AI Hackathon 2026 Enterprise Edition</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#13110F] leading-[1.1]">
            Procurement, Powered by{' '}
            <span className="relative inline-block">
              Intelligence
              <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#F2C8A8]/60 -z-10 rounded-sm"></span>
            </span>
            .
          </h1>

          <p className="text-base sm:text-xl text-[#6B6560] max-w-2xl mx-auto font-normal leading-relaxed">
            Automate sourcing, discover trusted suppliers, optimise purchasing decisions and manage payments through one intelligent procurement platform.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 text-sm font-semibold"
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
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B6560] font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#3E5C31]" />
              PayPal Orders API v2
            </span>
            <span className="hidden sm:inline text-[rgba(19,17,15,0.2)]">•</span>
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-[#13110F]" />
              Google Gemini 1.5 Pro
            </span>
            <span className="hidden sm:inline text-[rgba(19,17,15,0.2)]">•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#13110F]" />
              Immutable Audit Trail
            </span>
            <span className="hidden sm:inline text-[rgba(19,17,15,0.2)]">•</span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#6B6560]" />
              Supabase PostgreSQL RLS
            </span>
          </div>
        </div>

        {/* Hero Interactive App Preview */}
        <div className="max-w-6xl mx-auto mt-14 rounded-2xl border border-[rgba(19,17,15,0.08)] shadow-2xl bg-white p-2 sm:p-4 overflow-hidden">
          <div className="bg-[#13110F] rounded-xl overflow-hidden text-[#FAF7F2] p-4 sm:p-6 space-y-5 border border-[rgba(244,238,230,0.08)]">
            <div className="flex items-center justify-between border-b border-[rgba(244,238,230,0.08)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E57373]"></span>
                <span className="w-3 h-3 rounded-full bg-[#FFD54F]"></span>
                <span className="w-3 h-3 rounded-full bg-[#B4C7A6]"></span>
                <span className="ml-2 font-mono text-xs text-[#8C847D]">procureai.enterprise/dashboard</span>
              </div>
              <Badge variant="success" dot size="sm">
                Sandbox Orders v2 Ready
              </Badge>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-xl bg-[#1C1916] border border-[rgba(244,238,230,0.08)]">
                <span className="text-[11px] text-[#8C847D] block font-medium">Platform GMV Volume</span>
                <span className="text-xl sm:text-2xl font-bold text-[#FAF7F2] font-mono mt-1 block">₹1,24,50,000</span>
                <span className="text-[10px] text-[#B4C7A6] flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +14.2% AI savings
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#1C1916] border border-[rgba(244,238,230,0.08)]">
                <span className="text-[11px] text-[#8C847D] block font-medium">Commercial Suppliers</span>
                <span className="text-xl sm:text-2xl font-bold text-[#FAF7F2] font-mono mt-1 block">8 Vendors</span>
                <span className="text-[10px] text-[#8C847D] mt-1 block">100% KYC Verified</span>
              </div>

              <div className="p-4 rounded-xl bg-[#1C1916] border border-[rgba(244,238,230,0.08)]">
                <span className="text-[11px] text-[#8C847D] block font-medium">Session Lock Protection</span>
                <span className="text-xl sm:text-2xl font-bold text-[#FAF7F2] font-mono mt-1 block">300 Seconds</span>
                <span className="text-[10px] text-[#F2C8A8] mt-1 block">Zero Price Slippage</span>
              </div>

              <div className="p-4 rounded-xl bg-[#1C1916] border border-[rgba(244,238,230,0.08)]">
                <span className="text-[11px] text-[#8C847D] block font-medium">Audit Trail Records</span>
                <span className="text-xl sm:text-2xl font-bold text-[#FAF7F2] font-mono mt-1 block">100% Verified</span>
                <span className="text-[10px] text-[#FAF7F2]/70 mt-1 block">Tamper-Proof Audit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autonomous Procurement Workflow Section */}
      <section id="workflow" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="neutral" size="sm">Connected Autonomous Pipeline</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#13110F] tracking-tight">
            The 8-Stage Procurement Journey
          </h2>
          <p className="text-sm text-[#6B6560]">
            From natural language prompt parsing to instant PayPal Orders API v2 settlement and cryptographic ledger verification.
          </p>
        </div>

        <ProcurementWorkflowJourney currentActiveStage={6} interactive={true} />
      </section>

      {/* Core Platform Capabilities Section */}
      <section id="features" className="py-20 px-6 sm:px-12 bg-[#FAF7F2] border-y border-[rgba(19,17,15,0.08)]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="neutral" size="sm">ProcureAI 2.0 Architecture</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#13110F] tracking-tight">
              Enterprise Procurement Redefined
            </h2>
            <p className="text-sm text-[#6B6560]">
              Four unified modules engineered for maximum efficiency, compliance, and instant settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hoverEffect className="space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#EDE6DC] text-[#13110F] flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#13110F]">AI Procurement Terminal</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Describe equipment requirements conversationally. The agent extracts verified SKUs and matches database inventory.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#13110F] flex items-center gap-1">
                Gemini 1.5 Pro Integrated <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card hoverEffect className="space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#EDE6DC] text-[#13110F] flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#13110F]">Multi-Criteria Intelligence</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Tune algorithmic weights across Price, Availability, Lead Time, SLA, and ESG compliance with live recalculation.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#13110F] flex items-center gap-1">
                5-Factor Scoring Model <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card hoverEffect className="space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#EDE6DC] text-[#13110F] flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#13110F]">PayPal Orders API v2</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                300-second price integrity sessions. Eliminates stale quotes and guarantees instant merchant payout capture.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#13110F] flex items-center gap-1">
                Time-Locked Settlement <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card hoverEffect className="space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#EDE6DC] text-[#13110F] flex items-center justify-center font-bold">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#13110F]">Compliance & Audit Trail</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Every purchase order, approval, and settlement is verified and permanently recorded in an immutable audit log.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#13110F] flex items-center gap-1">
                Verified Audit Log <ArrowRight className="w-3 h-3" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & PayPal Section */}
      <section id="security" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#13110F] text-[#FAF7F2] space-y-8 shadow-xl border border-[rgba(244,238,230,0.08)]">
          <div className="max-w-2xl space-y-3">
            <Badge variant="default" className="bg-[#26221F] text-[#F2C8A8] border border-[rgba(242,200,168,0.25)]">
              Fintech & PayPal Security Architecture
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#FAF7F2]">
              Enterprise Control Meets Seamless Settlement
            </h2>
            <p className="text-xs sm:text-sm text-[#8C847D] leading-relaxed">
              ProcureAI enforces strict human governance thresholds: agents draft purchase orders, but only authorized human managers can sign off on PayPal disbursements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[rgba(244,238,230,0.08)]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#B4C7A6] font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Zero Client-Side Trust
              </div>
              <p className="text-xs text-[#8C847D] leading-relaxed">
                Payable amounts are bound cryptographically to approved purchase order hashes verified on the server.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#F2C8A8] font-semibold text-sm">
                <Clock className="w-4 h-4" /> 300-Second Expiry Window
              </div>
              <p className="text-xs text-[#8C847D] leading-relaxed">
                Locks supplier inventory and contracted prices against market fluctuations and currency swings.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#FAF7F2] font-semibold text-sm">
                <Lock className="w-4 h-4" /> Compliance Audit Trail
              </div>
              <p className="text-xs text-[#8C847D] leading-relaxed">
                Every transaction permanently records timestamp, authorized user identity, approval state, and order references.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#8C847D]">
              Ready to evaluate ProcureAI 2.0 with live PayPal Sandbox integration?
            </span>
            <Link to="/login">
              <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Launch ProcureAI Application
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-[rgba(19,17,15,0.08)] bg-white px-6 sm:px-12 py-10 text-xs text-[#6B6560]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#F2C8A8] text-[#13110F] flex items-center justify-center font-bold text-xs">
              P
            </div>
            <div>
              <span className="font-bold text-[#13110F] block">ProcureAI 2.0</span>
              <span className="text-[11px] text-[#8C847D]">PayPal AI Hackathon 2026 Production Submission</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[#6B6560] font-medium">
            <Link to="/login?role=buyer" className="hover:text-[#13110F]">Buyer Portal</Link>
            <Link to="/login?role=supplier" className="hover:text-[#13110F]">Supplier Portal</Link>
            <Link to="/login?role=admin" className="hover:text-[#13110F]">Admin Control Tower</Link>
            <a
              href="https://github.com/santhoshaiworks03-tech/ProcureAI"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#13110F] flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-[rgba(19,17,15,0.05)] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C847D]">
          <span>© 2026 ProcureAI Inc. All rights reserved.</span>
          <span>Engineered with React 18, TypeScript, Tailwind CSS, Supabase RLS & PayPal Orders v2.</span>
        </div>
      </footer>
    </div>
  );
};
