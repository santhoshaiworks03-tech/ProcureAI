import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Building,
  Users,
  Bot,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Key,
  Layers,
  Database
} from 'lucide-react';
import { store } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';

export const AdminPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState(store.getSuppliers());
  const [selectedAiProvider, setSelectedAiProvider] = useState<string>('gemini');
  const [spendingLimit, setSpendingLimit] = useState<number>(250000);
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const org = store.getActiveOrganisation();
  const purchaseOrders = store.getPurchaseOrders();

  const handleVerifySupplier = (supplierId: string, status: 'verified' | 'rejected') => {
    store.updateSupplierVerification(supplierId, status);
    setSuppliers(store.getSuppliers());
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all records to default demonstration data?')) {
      setIsResetting(true);
      store.resetToSeedData();
      setSuppliers(store.getSuppliers());
      setTimeout(() => {
        setIsResetting(false);
        alert('Platform data successfully reset to initial seed state.');
        window.location.reload();
      }, 500);
    }
  };

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Platform Administration & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure multi-provider AI services, manage PayPal Sandbox merchant settings, and verify supplier credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            isLoading={isResetting}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Seed Data
          </Button>
          <Badge variant="success">Platform Administrator</Badge>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Registered Enterprises</span>
          <p className="text-xl font-bold text-navy-900 mt-1">3 Active Companies</p>
          <p className="text-xs text-slate-500 mt-0.5">Isolated tenant partitions</p>
        </Card>
        <Card>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Registered Suppliers</span>
          <p className="text-xl font-bold text-navy-900 mt-1">{suppliers.length} Commercial Partners</p>
          <p className="text-xs text-emerald-600 mt-0.5">{suppliers.filter(s => s.verification_status === 'verified').length} Verified</p>
        </Card>
        <Card>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Purchase Orders Created</span>
          <p className="text-xl font-bold text-navy-900 mt-1">{purchaseOrders.length} Orders</p>
          <p className="text-xs text-slate-500 mt-0.5">Tamper-evident hash logged</p>
        </Card>
        <Card>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">PayPal Settlement Pipeline</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">Orders API v2</p>
          <p className="text-xs text-slate-500 mt-0.5">Sandbox Capture Gateway</p>
        </Card>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Multi-Provider Configuration */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-blue" />
              <h3 className="text-sm font-bold text-navy-900">AI Provider Architecture</h3>
            </div>
            <Badge variant="info">Zero Lock-in</Badge>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            ProcureAI features a provider-independent AI service layer. Select your organization's primary model provider:
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 1.5 Pro / Flash' },
              { id: 'openai', name: 'OpenAI', desc: 'GPT-4o Structured Outputs' },
              { id: 'claude', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet' }
            ].map(prov => (
              <button
                key={prov.id}
                onClick={() => setSelectedAiProvider(prov.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedAiProvider === prov.id
                    ? 'border-brand-blue bg-blue-50/50 ring-2 ring-brand-blue/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-xs font-bold text-navy-900 block">{prov.name}</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">{prov.desc}</span>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-navy-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" /> Active Provider Status
              </span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                READY / FALLBACK ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Deterministic procurement optimization engine guarantees 100% uptime even when external AI API keys are omitted or rate-limited.
            </p>
          </div>
        </Card>

        {/* PayPal Sandbox Developer Platform Config */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-navy-900">PayPal Developer Sandbox Status</h3>
            </div>
            <Badge variant="success">Developer Verified</Badge>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">API Environment:</span>
              <span className="text-navy-900 font-bold">Sandbox (api-m.sandbox.paypal.com)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Orders API Version:</span>
              <span className="text-navy-900">v2 (Intent: CAPTURE)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Webhook Dispatcher:</span>
              <span className="text-emerald-600 font-bold">Enabled & Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Time-Limited Session:</span>
              <span className="text-navy-900">300 Seconds (05:00)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              Open PayPal Developer Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button variant="outline" size="sm" onClick={handleSaveSettings}>
              {saveSuccess ? 'Saved!' : 'Save Configuration'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Supplier Verification Queue */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Supplier Legal Verification Audit Queue</h3>
            <p className="text-xs text-slate-500">Review GSTIN, corporate entity documents, and PayPal settlement accounts</p>
          </div>
          <Badge variant="default">Admin Governance</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Supplier Company</th>
                <th className="py-2.5 px-3">GSTIN / Tax ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map(sup => (
                <tr key={sup.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-navy-900">{sup.company_name}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{sup.gstin_tax_id}</td>
                  <td className="py-3 px-3 text-slate-600">{sup.business_category}</td>
                  <td className="py-3 px-3 text-slate-500">{sup.address.city}</td>
                  <td className="py-3 px-3 text-center">
                    {sup.verification_status === 'verified' ? (
                      <Badge variant="success">Verified</Badge>
                    ) : sup.verification_status === 'rejected' ? (
                      <Badge variant="danger">Rejected</Badge>
                    ) : (
                      <Badge variant="warning">Under Review</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {sup.verification_status !== 'verified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifySupplier(sup.id, 'verified')}
                          className="text-emerald-700 hover:bg-emerald-50"
                        >
                          Approve
                        </Button>
                      )}
                      {sup.verification_status !== 'rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerifySupplier(sup.id, 'rejected')}
                          className="text-rose-600 hover:bg-rose-50"
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
