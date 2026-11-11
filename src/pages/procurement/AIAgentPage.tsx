import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  ShieldCheck,
  Building,
  ArrowRight,
  RefreshCw,
  Lock,
  Layers,
  FileText,
  Sparkles,
  Edit3,
  Sliders,
  CheckCircle2,
  Plus,
  Package,
  Calendar,
  Truck
} from 'lucide-react';
import { store } from '../../lib/store';
import { aiProcurementService } from '../../services/ai/aiService';
import {
  ExtractedProcurementPlan,
  SupplierEvaluation,
  ProcurementRecommendation,
  PurchaseOrder
} from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { PurchaseOrderCustomizerModal } from '../../components/orders/PurchaseOrderCustomizerModal';

export const AIAgentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultPrompt =
    searchParams.get('prompt') ||
    'I need 50 office chairs, 30 office desks and 20 filing cabinets. My budget is ₹5,00,000. Find reliable suppliers, compare prices, estimate delivery and prepare the best purchase order.';

  // Mode state: 'ai' = AI Autonomous Mode, 'manual' = Manual Order Customizer
  const [procurementMode, setProcurementMode] = useState<'ai' | 'manual'>('ai');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerMode, setCustomizerMode] = useState<'edit' | 'create'>('edit');
  const [customizationAlert, setCustomizationAlert] = useState<string | null>(null);

  const [inputPrompt, setInputPrompt] = useState(defaultPrompt);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Agent State
  const [extractedPlan, setExtractedPlan] = useState<ExtractedProcurementPlan | null>(null);
  const [evaluations, setEvaluations] = useState<SupplierEvaluation[]>([]);
  const [recommendation, setRecommendation] = useState<ProcurementRecommendation | null>(null);
  const [generatedPO, setGeneratedPO] = useState<PurchaseOrder | null>(null);

  const suggestedPrompts = [
    'I need 50 office chairs, 30 office desks and 20 filing cabinets. My budget is ₹5,00,000. Find reliable suppliers, compare prices, estimate delivery and prepare the best purchase order.',
    'Procure 10 UltraSharp 27-inch 4K monitors and 5 EliteBook laptops with budget ₹8,00,000 for our engineering team.',
    'Restock 60 AeroPro Ergonomic Chairs and 25 Under-Desk Cable Management Trays under ₹3,00,000.'
  ];

  const handleCustomizerSave = (savedOrder: PurchaseOrder) => {
    setGeneratedPO(savedOrder);
    setCustomizationAlert(`Purchase Order ${savedOrder.po_number} customized with updated items, pricing, and terms.`);
    setTimeout(() => setCustomizationAlert(null), 6000);

    if (recommendation) {
      setRecommendation({
        ...recommendation,
        totalProjectedCost: savedOrder.total_amount,
        selectedSuppliers: [
          {
            ...recommendation.selectedSuppliers[0],
            supplierId: savedOrder.supplier_id,
            supplierName: savedOrder.supplier_name,
            subtotal: savedOrder.subtotal_amount,
            tax: savedOrder.tax_amount,
            shipping: savedOrder.shipping_amount,
            total: savedOrder.total_amount,
            items: savedOrder.items.map(i => ({
              productId: i.product_id,
              productName: i.product_name,
              quantity: i.quantity,
              unitPrice: i.unit_price,
              total: i.total_amount
            }))
          },
          ...recommendation.selectedSuppliers.slice(1)
        ]
      });
    }
  };

  const handleLaunchManualCreate = () => {
    setCustomizerMode('create');
    setIsCustomizerOpen(true);
  };

  const handleOpenEditPO = () => {
    if (generatedPO) {
      setCustomizerMode('edit');
      setIsCustomizerOpen(true);
    }
  };

  const handleRunAgent = async (promptToRun = inputPrompt) => {
    if (!promptToRun.trim()) return;

    setIsProcessing(true);
    setActiveStep(1);
    setExtractedPlan(null);
    setEvaluations([]);
    setRecommendation(null);
    setGeneratedPO(null);
    setCustomizationAlert(null);

    try {
      await new Promise(r => setTimeout(r, 400));
      const plan = aiProcurementService.parseNaturalLanguageRequest(promptToRun);
      setExtractedPlan(plan);
      setActiveStep(2);

      await new Promise(r => setTimeout(r, 400));
      const evals = aiProcurementService.evaluateSuppliers(plan.items);
      setEvaluations(evals);
      setActiveStep(3);

      await new Promise(r => setTimeout(r, 500));
      const rec = aiProcurementService.optimizeProcurement(plan, evals);
      setRecommendation(rec);
      setActiveStep(4);

      const primaryVendor = rec.selectedSuppliers[0];
      const draftPOData = {
        organisation_id: store.getActiveOrganisation().id,
        organisation_name: store.getActiveOrganisation().name,
        supplier_id: primaryVendor.supplierId,
        supplier_name: primaryVendor.supplierName,
        created_by: store.getCurrentUser().id,
        created_by_name: store.getCurrentUser().full_name,
        subtotal_amount: primaryVendor.subtotal,
        tax_amount: primaryVendor.tax,
        shipping_amount: primaryVendor.shipping,
        total_amount: primaryVendor.total,
        currency: 'INR',
        status: 'pending_approval' as const,
        items: primaryVendor.items.map((i, idx) => ({
          id: `draft-poi-${idx}`,
          purchase_order_id: '',
          product_id: i.productId,
          product_name: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          unit_price: i.unitPrice,
          total_amount: i.total
        })),
        delivery_address: {
          recipient_name: `${store.getCurrentUser().full_name} (Facilities & Operations)`,
          street: '12th Floor, RMZ Ecospace, Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postal_code: '560103',
          country: 'India'
        },
        expected_delivery_date: new Date(Date.now() + (primaryVendor.deliveryDays + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        terms_and_conditions: 'Payment via PayPal Express Sandbox. Inspection within 48 hours of dock receipt. BIFMA certified.'
      };

      const po = await store.createPurchaseOrder(draftPOData);
      setGeneratedPO(po);
      setActiveStep(5);
    } catch (err) {
      console.error('Error running AI procurement agent:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Procurement Studio</span>
            <span className="text-xs font-normal text-slate-400 font-mono">v2.4</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dual procurement engine: Autonomous AI reasoning (Gemini 1.5) or manual granular purchase order customization.
          </p>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setProcurementMode('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                procurementMode === 'ai'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Autonomous Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setProcurementMode('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                procurementMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Manual Order Customizer</span>
            </button>
          </div>

          <Badge variant="default" dot>
            Human approval gate active
          </Badge>
        </div>
      </div>

      {/* Customization Alert Banner */}
      {customizationAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{customizationAlert}</span>
          </div>
          <Badge variant="success">Synchronized with Ledger & Approvals</Badge>
        </div>
      )}

      {/* ===================== MODE 1: AI AUTONOMOUS AGENT ===================== */}
      {procurementMode === 'ai' && (
        <>
          {/* Prompt Card */}
          <Card className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-slate-700" />
                  Natural language procurement requirement
                </label>
                <span className="text-[11px] text-slate-400">Powered by Gemini 1.5 Pro</span>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  value={inputPrompt}
                  onChange={e => setInputPrompt(e.target.value)}
                  placeholder="Describe what you need to purchase, required quantities, and budget cap..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#13110F] focus:border-[#13110F] bg-white resize-none"
                />
                <div className="absolute right-2.5 bottom-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRunAgent()}
                    isLoading={isProcessing}
                    leftIcon={<Bot className="w-3.5 h-3.5" />}
                  >
                    Analyze & evaluate
                  </Button>
                </div>
              </div>
            </div>

            {/* Suggested Prompts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium block">Reference prompts:</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputPrompt(p);
                      handleRunAgent(p);
                    }}
                    className="text-left text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors truncate max-w-xl"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ===================== MODE 2: MANUAL ORDER CUSTOMIZER ===================== */}
      {procurementMode === 'manual' && (
        <div className="space-y-6">
          {/* Manual Studio Banner */}
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm border-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-[#F2C8A8] text-xs font-semibold">
                  <Edit3 className="w-3.5 h-3.5" />
                  Buyer Direct Customizer
                </div>
                <h2 className="text-xl font-bold tracking-tight">Manual Purchase Order Studio</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Directly configure suppliers, line items, custom pricing, SLA delivery schedules, and compliance warranty terms. Combine with AI Copilot instant refinements or craft complete orders manually.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                <Button
                  variant="primary"
                  className="bg-[#F2C8A8] text-[#13110F] hover:bg-[#ebd5c3] font-semibold shadow-sm w-full sm:w-auto"
                  onClick={handleLaunchManualCreate}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Custom Purchase Order
                </Button>
                {generatedPO && (
                  <Button
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full sm:w-auto"
                    onClick={handleOpenEditPO}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Edit Active PO ({generatedPO.po_number})
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Start Presets Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Quick-Start Order Presets
              </span>
              <span className="text-[11px] text-slate-500">Click any preset to prefill and launch customizer</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={handleLaunchManualCreate}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                    <Building className="w-4 h-4" />
                  </div>
                  <Badge variant="default">Commercial Furnishings</Badge>
                </div>
                <h3 className="font-semibold text-slate-900 text-xs group-hover:text-black">
                  Executive Ergonomics Setup
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  50 Commercial Ergonomic Chairs, 30 Height-Adjustable Desks, and 20 Cable Organizers.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Approx: {formatCurrency(485000)}</span>
                  <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                    Customize <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div
                onClick={handleLaunchManualCreate}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-800">
                    <Package className="w-4 h-4" />
                  </div>
                  <Badge variant="default">IT Infrastructure</Badge>
                </div>
                <h3 className="font-semibold text-slate-900 text-xs group-hover:text-black">
                  Developer Workstation Kit
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  15 UltraSharp 27" 4K Monitors, 15 Ergonomic Keyboards, and 15 USB-C Docks.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Approx: {formatCurrency(650000)}</span>
                  <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                    Customize <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div
                onClick={handleLaunchManualCreate}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                    <Truck className="w-4 h-4" />
                  </div>
                  <Badge variant="default">Facilities & Supplies</Badge>
                </div>
                <h3 className="font-semibold text-slate-900 text-xs group-hover:text-black">
                  Facilities Restock Bundle
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  25 Heavy Duty Filing Cabinets, 40 Task Stools, and 30 Desktop Partitions.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Approx: {formatCurrency(310000)}</span>
                  <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                    Customize <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execution Progress */}
      {isProcessing && (
        <Card className="border-[rgba(19,17,15,0.12)] bg-[#FAF7F2] py-3">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-[#13110F] animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-900">
                {activeStep === 1 && 'Extracting specifications, quantities & budget...'}
                {activeStep === 2 && 'Matching requirement against master catalogue...'}
                {activeStep === 3 && 'Evaluating verified suppliers across 5 scoring dimensions...'}
                {activeStep === 4 && 'Optimizing procurement combination and preparing draft PO...'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Results Workspace */}
      {extractedPlan && recommendation && (
        <div className="space-y-6">
          {/* Step 1: Extracted Requirements */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-500">01</span>
                <h2 className="text-sm font-semibold text-slate-900">Structured requirement payload</h2>
              </div>
              <Badge variant="default">Validated</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 block">Budget cap</span>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">{formatCurrency(extractedPlan.maxBudget)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 block">Extracted categories</span>
                <span className="text-sm font-semibold text-slate-900">{extractedPlan.items.length} items</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 block">Destination</span>
                <span className="text-xs font-medium text-slate-900 truncate block">{extractedPlan.deliveryLocation}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/70 text-slate-500 text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-3 font-medium">Item</th>
                    <th className="py-2 px-3 font-medium text-center">Quantity</th>
                    <th className="py-2 px-3 font-medium text-right">Target Price</th>
                    <th className="py-2 px-3 font-medium">Specifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extractedPlan.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.itemName}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-900 tabular-nums">{item.quantity} units</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatCurrency(item.targetUnitPrice || 0)}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {item.specifications ? Object.entries(item.specifications).map(([k, v]) => `${k}: ${v}`).join(' • ') : 'Standard'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Step 2: Supplier Scoring Matrix */}
          <Card className="space-y-3 overflow-hidden p-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-500">02</span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Supplier evaluation matrix</h2>
                  <p className="text-[11px] text-slate-500">
                    Price (30%) • Stock (20%) • Speed (20%) • Reliability (20%) • Quality (10%)
                  </p>
                </div>
              </div>
              <Badge variant="default">Deterministic scoring</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/70 text-slate-500 text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Rank & Supplier</th>
                    <th className="py-2.5 px-3 font-medium text-center">Price</th>
                    <th className="py-2.5 px-3 font-medium text-center">Availability</th>
                    <th className="py-2.5 px-3 font-medium text-center">Lead time</th>
                    <th className="py-2.5 px-3 font-medium text-center">Reliability</th>
                    <th className="py-2.5 px-3 font-medium text-center">Composite</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluations.slice(0, 5).map((ev, idx) => (
                    <tr key={ev.supplierId} className={idx === 0 ? 'bg-[#FAF7F2]' : 'hover:bg-slate-50/40'}>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-medium ${
                            idx === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-medium text-slate-900 block">{ev.supplierName}</span>
                            <span className="text-[10px] text-slate-400">{ev.deliveryDays}-day delivery</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{ev.priceScore}%</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{ev.availabilityScore}%</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{ev.deliveryScore}%</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{ev.reliabilityScore}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-mono text-xs font-semibold tabular-nums ${idx === 0 ? 'text-[#13110F]' : 'text-slate-800'}`}>
                          {ev.compositeScore}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge variant={ev.isProvisional ? 'provisional' : 'success'} dot>
                          {ev.isProvisional ? 'Provisional' : 'Verified'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Step 3: Recommendation & Draft PO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500">03</span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Recommended order allocation</h2>
                    <p className="text-[11px] text-slate-500">Dual control: Generated by AI, customizable by Buyer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" dot>Recommended</Badge>
                  {generatedPO && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenEditPO}
                      leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#13110F]" />}
                    >
                      Edit PO Elements
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                <p>{recommendation.tradeoffExplanation}</p>
                <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                  {recommendation.riskAssessment}
                </p>
              </div>

              {generatedPO ? (
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{generatedPO.supplier_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">PO: {generatedPO.po_number}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">
                        {generatedPO.items.length} line {generatedPO.items.length === 1 ? 'item' : 'items'}
                      </Badge>
                      <button
                        type="button"
                        onClick={handleOpenEditPO}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Elements
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {generatedPO.items.map((line, lIdx) => (
                      <div key={line.id || lIdx} className="flex items-center justify-between py-2">
                        <div>
                          <span className="text-slate-900 font-medium block">{line.product_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatCurrency(line.unit_price)} × {line.quantity} units
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(line.total_amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                    <span className="text-[11px]">
                      Subtotal: <strong className="text-slate-900">{formatCurrency(generatedPO.subtotal_amount)}</strong> • GST (18%): <strong className="text-slate-900">{formatCurrency(generatedPO.tax_amount)}</strong> • Freight: <strong className="text-slate-900">{formatCurrency(generatedPO.shipping_amount)}</strong>
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums text-sm">
                      Total: {formatCurrency(generatedPO.total_amount)}
                    </span>
                  </div>
                </div>
              ) : (
                recommendation.selectedSuppliers.map((sup, sIdx) => (
                  <div key={sIdx} className="border border-slate-200 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" /> {sup.supplierName}
                      </span>
                      <span className="text-[11px] text-slate-500">{sup.deliveryDays} business days</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {sup.items.map((line, lIdx) => (
                        <div key={lIdx} className="flex items-center justify-between py-1.5">
                          <span className="text-slate-700">{line.productName} (x{line.quantity})</span>
                          <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(line.total)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Subtotal: {formatCurrency(sup.subtotal)} • GST (18%): {formatCurrency(sup.tax)} • Shipping: {formatCurrency(sup.shipping)}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(sup.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </Card>

            {/* Financial Summary & Human Gate Box */}
            <Card className="flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                  Financial summary
                </h3>

                <div className="space-y-2.5 text-xs text-slate-600 mb-5">
                  <div className="flex justify-between">
                    <span>Budget cap:</span>
                    <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(extractedPlan.maxBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order total:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(generatedPO ? generatedPO.total_amount : recommendation.totalProjectedCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium pt-1.5 border-t border-slate-100">
                    <span>Identified savings:</span>
                    <span className="tabular-nums">{formatCurrency(recommendation.estimatedSavings)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Budget utilization:</span>
                    <span className="tabular-nums">
                      {generatedPO
                        ? Math.min(100, Math.round((generatedPO.total_amount / extractedPlan.maxBudget) * 100))
                        : recommendation.budgetUtilizationPercentage}%
                    </span>
                  </div>
                </div>

                {generatedPO && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-slate-900">{generatedPO.po_number}</span>
                      <Badge variant="warning" dot>Pending approval</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Human authorization required before checkout.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                {generatedPO && (
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-50 text-slate-800"
                    onClick={handleOpenEditPO}
                    leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#13110F]" />}
                  >
                    Edit & Customize PO Elements
                  </Button>
                )}
                {generatedPO && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate(`/approvals?po=${generatedPO.id}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Go to approval queue
                  </Button>
                )}
                {generatedPO && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/orders?id=${generatedPO.id}`)}
                  >
                    Inspect PO & PDF
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Purchase Order Customizer Modal */}
      <PurchaseOrderCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        order={customizerMode === 'edit' ? generatedPO : null}
        mode={customizerMode}
        onSave={handleCustomizerSave}
      />
    </div>
  );
};
