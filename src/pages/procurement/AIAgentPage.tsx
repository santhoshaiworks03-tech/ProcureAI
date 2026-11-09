import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Layers,
  FileText,
  DollarSign,
  AlertCircle,
  Truck,
  Building,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { store } from '../../lib/store';
import { aiProcurementService } from '../../services/ai/aiService';
import {
  ExtractedProcurementPlan,
  SupplierEvaluation,
  ProcurementRecommendation,
  PurchaseOrder,
  AIAgentChatMessage
} from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';

export const AIAgentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultPrompt =
    searchParams.get('prompt') ||
    'I need 50 office chairs, 30 office desks and 20 filing cabinets. My budget is ₹5,00,000. Find reliable suppliers, compare prices, estimate delivery and prepare the best purchase order.';

  const [inputPrompt, setInputPrompt] = useState(defaultPrompt);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Agent State
  const [extractedPlan, setExtractedPlan] = useState<ExtractedProcurementPlan | null>(null);
  const [evaluations, setEvaluations] = useState<SupplierEvaluation[]>([]);
  const [recommendation, setRecommendation] = useState<ProcurementRecommendation | null>(null);
  const [generatedPO, setGeneratedPO] = useState<PurchaseOrder | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const suggestedPrompts = [
    'I need 50 office chairs, 30 office desks and 20 filing cabinets. My budget is ₹5,00,000. Find reliable suppliers, compare prices, estimate delivery and prepare the best purchase order.',
    'Procure 10 UltraSharp 27-inch 4K monitors and 5 EliteBook laptops with budget ₹8,00,000 for our engineering team.',
    'Restock 60 AeroPro Ergonomic Chairs and 25 Under-Desk Cable Management Trays under ₹3,00,000.',
    'Compare top suppliers for height-adjustable standing desks with 3-day fast delivery.'
  ];

  const handleRunAgent = async (promptToRun = inputPrompt) => {
    if (!promptToRun.trim()) return;

    setIsProcessing(true);
    setActiveStep(1); // Step 1: Parsing
    setExtractedPlan(null);
    setEvaluations([]);
    setRecommendation(null);
    setGeneratedPO(null);

    try {
      // Step 1: Natural Language Understanding & Extraction
      await new Promise(r => setTimeout(r, 600));
      const plan = aiProcurementService.parseNaturalLanguageRequest(promptToRun);
      setExtractedPlan(plan);
      setActiveStep(2); // Step 2: Catalog matching

      // Step 2 & 3: Supplier Discovery & Catalog Evaluation
      await new Promise(r => setTimeout(r, 700));
      const evals = aiProcurementService.evaluateSuppliers(plan.items);
      setEvaluations(evals);
      setActiveStep(3); // Step 3: Multi-criteria Scoring

      // Step 4 & 5: Procurement Optimization
      await new Promise(r => setTimeout(r, 800));
      const rec = aiProcurementService.optimizeProcurement(plan, evals);
      setRecommendation(rec);
      setActiveStep(4); // Step 4: PO Draft Generation

      // Step 6: Create draft PO in database store
      const primaryVendor = rec.selectedSuppliers[0];
      const sup = store.getSupplierById(primaryVendor.supplierId);

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
        status: 'pending_approval' as const, // Strictly requires human approval per prompt rules!
        items: primaryVendor.items.map((i, idx) => ({
          id: `draft-poi-${idx}`,
          purchase_order_id: '',
          product_id: i.productId,
          product_name: i.productName,
          quantity: i.quantity,
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
      setActiveStep(5); // Complete
    } catch (err) {
      console.error('Error running AI procurement agent:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">
              Autonomous AI Procurement Agent
            </h1>
            <Badge variant="info">
              <Sparkles className="w-3 h-3 text-brand-blue" /> Multi-Provider Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enter business purchasing requirements in plain English. The agent matches products, scores suppliers, optimizes orders, and prepares PayPal checkout with human authorization gating.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Human Approval Gate Enforced
          </Badge>
        </div>
      </div>

      {/* Interactive Prompt Workspace */}
      <Card className="border-brand-blue/30 shadow-card bg-gradient-to-b from-white to-slate-50/40">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy-900">
            <Bot className="w-4 h-4 text-brand-blue" />
            <span>Enter Natural Language Requirement</span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              placeholder="e.g. I need 50 office chairs, 30 office desks and 20 filing cabinets. My budget is ₹5,00,000..."
              className="w-full p-4 rounded-xl border border-slate-200 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white resize-none"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleRunAgent()}
                isLoading={isProcessing}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Analyze & Optimize
              </Button>
            </div>
          </div>

          {/* Preset Suggested Prompts */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Suggested Enterprise Prompts:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputPrompt(p);
                    handleRunAgent(p);
                  }}
                  className="text-left text-xs bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-brand-blue/40 text-slate-700 px-3 py-1.5 rounded-lg transition-all line-clamp-1 max-w-md shadow-2xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Execution Pipeline Indicator */}
      {isProcessing && (
        <Card className="border-brand-blue/40 bg-blue-50/40">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-navy-900">
                {activeStep === 1 && 'Extracting specifications, quantities & budget from natural language...'}
                {activeStep === 2 && 'Matching requirement against 30 master catalogue products...'}
                {activeStep === 3 && 'Evaluating verified suppliers using multi-criteria weighted scoring...'}
                {activeStep === 4 && 'Optimizing procurement combination & generating draft Purchase Order...'}
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-brand-blue h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(activeStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Workspace: Rendered when extraction and recommendations are ready */}
      {extractedPlan && recommendation && (
        <div className="space-y-6">
          {/* Step 1: Extracted Requirements Banner */}
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="text-sm font-bold text-navy-900">Extracted Product Specifications & Budget</h3>
              </div>
              <Badge variant="info">Structured JSON Validated</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Total Budget Cap</span>
                <span className="text-base font-bold text-navy-900">{formatCurrency(extractedPlan.maxBudget)}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Line Items Extracted</span>
                <span className="text-base font-bold text-navy-900">{extractedPlan.items.length} Product Categories</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Delivery Destination</span>
                <span className="text-xs font-semibold text-navy-900 truncate block">{extractedPlan.deliveryLocation}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Item Requirement</th>
                    <th className="py-2 px-3">Matched SKU</th>
                    <th className="py-2 px-3 text-center">Required Qty</th>
                    <th className="py-2 px-3">Technical Specifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extractedPlan.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-navy-900">{item.itemName}</td>
                      <td className="py-2.5 px-3 font-mono text-brand-blue">{item.sku || 'CAT-MATCH'}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-navy-900">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.specifications ? Object.entries(item.specifications).map(([k, v]) => `${k}: ${v}`).join(' | ') : 'Standard enterprise grade'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Step 2 & 3: Supplier Scoring Comparison Table */}
          <Card>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-navy-900">Multi-Criteria Supplier Evaluation & Scoring</h3>
                  <p className="text-[11px] text-slate-500">
                    Price (30%) • Availability (20%) • Delivery Speed (20%) • Reliability (20%) • ESG Quality (10%)
                  </p>
                </div>
              </div>
              <Badge variant="success">Transparent Math</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Rank & Supplier</th>
                    <th className="py-2.5 px-3 text-center">Price Score (30%)</th>
                    <th className="py-2.5 px-3 text-center">Availability (20%)</th>
                    <th className="py-2.5 px-3 text-center">Lead Time (20%)</th>
                    <th className="py-2.5 px-3 text-center">Reliability (20%)</th>
                    <th className="py-2.5 px-3 text-center">Composite Score</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluations.slice(0, 5).map((ev, idx) => (
                    <tr
                      key={ev.supplierId}
                      className={idx === 0 ? 'bg-blue-50/40 font-medium' : 'hover:bg-slate-50/50'}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0 ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-navy-900 block">{ev.supplierName}</span>
                            <span className="text-[10px] text-slate-500">Avg Lead Time: {ev.deliveryDays} business days</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">{ev.priceScore}/100</td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">{ev.availabilityScore}/100</td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">{ev.deliveryScore}/100</td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">{ev.reliabilityScore}/100</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                            idx === 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ev.compositeScore}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {ev.isProvisional ? (
                          <Badge variant="provisional">Provisional Score</Badge>
                        ) : (
                          <Badge variant="success">Verified Supplier</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Step 3: AI Recommendation & Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-emerald-300 shadow-card bg-white">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <h3 className="text-sm font-bold text-navy-900">Recommended Optimal Purchasing Allocation</h3>
                </div>
                <Badge variant="success">Optimal Combination Selected</Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {recommendation.tradeoffExplanation}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p>{recommendation.riskAssessment}</p>
                </div>
              </div>

              {/* Vendor Item Details */}
              {recommendation.selectedSuppliers.map((sup, sIdx) => (
                <div key={sIdx} className="border border-slate-200 rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-brand-blue" /> {sup.supplierName}
                    </span>
                    <span className="text-xs text-slate-500">Lead Time: {sup.deliveryDays} Days</span>
                  </div>

                  <div className="space-y-1.5 divide-y divide-slate-100 text-xs">
                    {sup.items.map((line, lIdx) => (
                      <div key={lIdx} className="flex items-center justify-between pt-1.5">
                        <span className="text-slate-700">{line.productName} (x{line.quantity})</span>
                        <span className="font-semibold text-navy-900">{formatCurrency(line.total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>Subtotal: {formatCurrency(sup.subtotal)} | GST (18%): {formatCurrency(sup.tax)} | Shipping: {formatCurrency(sup.shipping)}</span>
                    <span className="font-bold text-navy-900 text-sm">{formatCurrency(sup.total)}</span>
                  </div>
                </div>
              ))}
            </Card>

            {/* Financial Summary & Human Approval Action Card */}
            <Card className="border-brand-blue/30 bg-gradient-to-b from-white to-blue-50/30">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-navy-900">Procurement Financial Summary</h3>
                <p className="text-xs text-slate-500">Automated price validation & budget health</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Authorized Budget Cap:</span>
                  <span className="font-semibold text-navy-900">{formatCurrency(extractedPlan.maxBudget)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Projected Order Total:</span>
                  <span className="font-bold text-navy-900 text-sm">{formatCurrency(recommendation.totalProjectedCost)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-semibold pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> AI Budget Savings:
                  </span>
                  <span>{formatCurrency(recommendation.estimatedSavings)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Budget Utilization:</span>
                  <span>{recommendation.budgetUtilizationPercentage}%</span>
                </div>
              </div>

              {/* Purchase Order Generated Block */}
              {generatedPO && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand-blue font-mono">{generatedPO.po_number}</span>
                    <Badge variant="warning">AWAITING HUMAN APPROVAL</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Purchase Order has been prepared and placed in the Approval Queue. AI is strictly prohibited from executing financial transactions without an authorized human signature.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {generatedPO ? (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate(`/approvals?po=${generatedPO.id}`)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Go to Approval Queue
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleRunAgent()}
                  >
                    Generate Purchase Order
                  </Button>
                )}

                {generatedPO && (
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => navigate(`/orders?id=${generatedPO.id}`)}
                  >
                    Review PO Details & PDF
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
