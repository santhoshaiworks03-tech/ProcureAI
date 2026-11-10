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
          <div className="bg-[#13110F] px-3 py-1.5 rounded-2xl flex items-center shadow-md border border-black/20">
            <img
              src="/procureai-logo.png"
              alt="ProcureAI"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </div>
          <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
            v2.0
          </Badge>
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

        {/* Hero Interactive App Preview Showcase */}
        <div className="max-w-5xl mx-auto mt-12 rounded-3xl border border-[rgba(19,17,15,0.1)] shadow-2xl bg-white p-2 sm:p-3 overflow-hidden group">
          <div className="relative rounded-2xl overflow-hidden bg-[#13110F]">
            <img
              src="/hero-laptop.jpg"
              alt="ProcureAI Enterprise Platform on Laptop"
              className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-700"
            />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#13110F]/85 backdrop-blur-md border border-white/10 hidden sm:flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B4C7A6] animate-pulse"></span>
                <span className="font-semibold">ProcureAI 2.0 Autonomous Procurement Terminal</span>
                <span className="text-[#F2C8A8] text-[11px] font-mono">• PayPal Orders v2 Capture</span>
              </div>
              <Link to="/login">
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Explore Live Demo
                </Button>
              </Link>
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
            <div className="bg-[#13110F] px-3 py-1.5 rounded-2xl flex items-center shadow-sm">
              <img
                src="/procureai-logo.png"
                alt="ProcureAI 2.0"
                className="h-6 w-auto object-contain"
              />
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
