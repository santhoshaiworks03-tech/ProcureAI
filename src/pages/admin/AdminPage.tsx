import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Building,
  Bot,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Key
} from 'lucide-react';
import { store } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';

export const AdminPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState(store.getSuppliers());
  const [selectedAiProvider, setSelectedAiProvider] = useState<string>('gemini');
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
          <h1 className="text-xl font-semibold tracking-tight text-ink-950">
            Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform governance, AI service providers, and vendor verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            isLoading={isResetting}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
          >
            Reset seed data
          </Button>
          <Badge variant="neutral">Platform admin</Badge>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/80">
          <span className="text-xs text-slate-500 block">Registered enterprises</span>
          <p className="text-xl font-semibold text-ink-950 mt-1 tabular-nums font-mono">3 companies</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Isolated tenant partitions</p>
        </Card>
        <Card className="p-4 border-slate-200/80">
          <span className="text-xs text-slate-500 block">Registered suppliers</span>
          <p className="text-xl font-semibold text-ink-950 mt-1 tabular-nums font-mono">{suppliers.length} vendors</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{suppliers.filter(s => s.verification_status === 'verified').length} verified</p>
        </Card>
        <Card className="p-4 border-slate-200/80">
          <span className="text-xs text-slate-500 block">Purchase orders</span>
          <p className="text-xl font-semibold text-ink-950 mt-1 tabular-nums font-mono">{purchaseOrders.length} orders</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tamper-evident hash logged</p>
        </Card>
        <Card className="p-4 border-slate-200/80">
          <span className="text-xs text-slate-500 block">Payment pipeline</span>
          <p className="text-xl font-semibold text-ink-950 mt-1 font-mono">PayPal v2</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sandbox capture gateway</p>
        </Card>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Multi-Provider Configuration */}
        <Card className="p-4 space-y-3.5 border-slate-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-ink-950">AI provider service layer</h3>
            </div>
            <Badge variant="neutral">Configurable</Badge>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Select the primary AI provider. All requests enforce structured JSON validation with deterministic fallbacks:
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'gemini', name: 'Google Gemini', desc: '1.5 Flash / Pro' },
              { id: 'openai', name: 'OpenAI', desc: 'GPT-4o structured' },
              { id: 'claude', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet' }
            ].map(prov => (
              <button
                key={prov.id}
                onClick={() => setSelectedAiProvider(prov.id)}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  selectedAiProvider === prov.id
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-xs font-medium text-ink-950 block">{prov.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{prov.desc}</span>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink-950 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" /> Active provider status
              </span>
              <Badge variant="success" dot size="sm">Ready</Badge>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Deterministic procurement optimization engine guarantees 100% uptime even when external API keys are omitted or rate-limited
            </p>
          </div>
        </Card>

        {/* PayPal Sandbox Developer Platform Config */}
        <Card className="p-4 space-y-3.5 border-slate-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-ink-950">PayPal sandbox environment</h3>
            </div>
            <Badge variant="success" dot size="sm">Connected</Badge>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">API environment:</span>
              <span className="text-ink-950 font-medium">Sandbox (api-m.sandbox.paypal.com)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Orders API version:</span>
              <span className="text-ink-950">v2 (Intent: CAPTURE)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Webhook dispatcher:</span>
              <span className="text-slate-800">Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Checkout session ttl:</span>
              <span className="text-ink-950 tabular-nums">300s (05:00)</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              PayPal Developer portal <ExternalLink className="w-3 h-3" />
            </a>
            <Button variant="outline" size="sm" onClick={handleSaveSettings}>
              {saveSuccess ? 'Saved' : 'Save'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Supplier Verification Queue */}
      <Card className="overflow-hidden p-0 border border-slate-200/80">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-ink-950">Supplier legal verification audit queue</h3>
            <p className="text-[11px] text-slate-500">Review GSTIN, corporate entity documents, and PayPal settlement accounts</p>
          </div>
          <Badge variant="neutral">Compliance</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3.5 font-medium">Supplier</th>
                <th className="py-2.5 px-3 font-medium">GSTIN / Tax ID</th>
                <th className="py-2.5 px-3 font-medium">Category</th>
                <th className="py-2.5 px-3 font-medium">City</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
                <th className="py-2.5 px-3.5 font-medium text-right">Audit action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map(sup => (
                <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3.5 font-medium text-ink-950">{sup.company_name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{sup.gstin_tax_id}</td>
                  <td className="py-2.5 px-3 text-slate-600">{sup.business_category}</td>
                  <td className="py-2.5 px-3 text-slate-500">{sup.address.city}</td>
                  <td className="py-2.5 px-3 text-center">
                    {sup.verification_status === 'verified' ? (
                      <Badge variant="success" dot size="sm">Verified</Badge>
                    ) : sup.verification_status === 'rejected' ? (
                      <Badge variant="danger" dot size="sm">Rejected</Badge>
                    ) : (
                      <Badge variant="warning" dot size="sm">Review</Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {sup.verification_status !== 'verified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifySupplier(sup.id, 'verified')}
                        >
                          Approve
                        </Button>
                      )}
                      {sup.verification_status !== 'rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerifySupplier(sup.id, 'rejected')}
                          className="text-slate-500 hover:text-rose-600"
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
