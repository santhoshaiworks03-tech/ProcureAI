import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Download,
  AlertTriangle,
  RotateCcw,
  Terminal,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../../lib/store';
import { paypalService } from '../../services/paypal/paypalService';
import { PurchaseOrder, CheckoutSession, PaymentRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { generatePurchaseOrderPDF } from '../../services/pdf/pdfService';

export const PaymentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const targetPoId = searchParams.get('po');

  const [approvedOrders, setApprovedOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<PaymentRecord | null>(null);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>(store.getPayments());
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [simulatedWebhook, setSimulatedWebhook] = useState<{ event: string; timestamp: string; payload: any } | null>(null);

  useEffect(() => {
    const refresh = () => {
      const orders = store.getPurchaseOrders().filter(
        po => po.status === 'approved' || po.status === 'payment_pending'
      );
      setApprovedOrders(orders);
      setRecentPayments(store.getPayments());

      if (targetPoId) {
        const found = store.getPurchaseOrderById(targetPoId);
        if (found) setSelectedPO(found);
      } else if (orders.length > 0 && !selectedPO) {
        setSelectedPO(orders[0]);
      }
    };

    refresh();
    const unsub = store.subscribe(refresh);
    return unsub;
  }, [targetPoId]);

  useEffect(() => {
    let timerInterval: any = null;

    if (selectedPO) {
      paypalService.initializeCheckout(selectedPO.id).then(sess => {
        setCheckoutSession(sess);
        setRemainingSeconds(300);
      });

      timerInterval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [selectedPO]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompletePayment = async () => {
    if (!selectedPO || !checkoutSession) return;

    if (remainingSeconds <= 0) {
      setPaymentError('Checkout session token expired (300s window elapsed). Re-initializing price lock...');
      const newSess = await paypalService.initializeCheckout(selectedPO.id);
      setCheckoutSession(newSess);
      setRemainingSeconds(300);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    try {
      const sandboxOrderId = `5O${Date.now().toString().slice(-8)}TN${Math.floor(100000 + Math.random() * 900000)}`;

      const payment = await paypalService.capturePayPalOrder({
        paypalOrderId: sandboxOrderId,
        checkoutSessionId: checkoutSession.id,
        purchaseOrderId: selectedPO.id,
        payerEmail: 'priya.buyer-buyer@apextech.com'
      });

      setCompletedPayment(payment);

      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || 'Payment capture failed. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateWebhook = (eventType: string) => {
    const eventId = `WH-9TR${Date.now().toString().slice(-8)}`;
    const nowIso = new Date().toISOString();
    const payload = {
      id: eventId,
      event_version: '1.0',
      create_time: nowIso,
      resource_type: eventType.includes('CAPTURE') ? 'capture' : 'checkout-order',
      event_type: eventType,
      summary: `PayPal Orders API v2 event: ${eventType}`,
      resource: {
        id: `CAP-${Math.floor(100000 + Math.random() * 900000)}`,
        status: eventType === 'PAYMENT.CAPTURE.COMPLETED' ? 'COMPLETED' : eventType === 'CHECKOUT.ORDER.APPROVED' ? 'APPROVED' : 'DENIED',
        amount: {
          currency_code: 'USD',
          value: selectedPO ? (selectedPO.total_amount / 83.5).toFixed(2) : '2480.00'
        },
        seller_protection: {
          status: 'ELIGIBLE'
        }
      }
    };
    setSimulatedWebhook({ event: eventType, timestamp: nowIso, payload });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Payment Settlement & Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tokenized sessions, server-side price locks, and verified PayPal Sandbox captures.
          </p>
        </div>
        <Badge variant="default" dot>
          PayPal Orders API v2
        </Badge>
      </div>

      {/* Main Payment Section */}
      {completedPayment ? (
        /* Voucher style receipt */
        <Card className="p-8 max-w-xl mx-auto border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-mono font-medium text-slate-500 block">SETTLEMENT RECEIPT</span>
              <span className="text-lg font-bold text-slate-900">{completedPayment.capture_id}</span>
            </div>
            <Badge variant="success" dot>Completed</Badge>
          </div>

          <div className="py-2 text-center">
            <span className="text-xs text-slate-500 block">Gross settled amount</span>
            <span className="text-3xl font-semibold text-slate-900 tabular-nums">
              {formatCurrency(completedPayment.amount, completedPayment.currency)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">PayPal Order ID:</span>
              <span className="font-mono text-slate-800">{completedPayment.paypal_order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payer email:</span>
              <span className="text-slate-800">{completedPayment.payer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Processing fee (2.5%):</span>
              <span className="font-mono text-slate-600">{formatCurrency(completedPayment.paypal_fee)}</span>
            </div>
            <div className="flex justify-between font-medium pt-1.5 border-t border-slate-200 text-slate-900">
              <span>Net settled to vendor:</span>
              <span className="text-emerald-700">{formatCurrency(completedPayment.net_amount)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => {
                const po = selectedPO || store.getPurchaseOrderById(completedPayment.purchase_order_id);
                if (po) generatePurchaseOrderPDF(po);
              }}
            >
              Download Tax Invoice
            </Button>
            <Link to="/orders">
              <Button variant="outline" size="sm">
                View purchase orders
              </Button>
            </Link>
            <Link to="/provenance">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Inspect provenance ledger
              </Button>
            </Link>
          </div>
        </Card>
      ) : selectedPO ? (
        /* Active Checkout Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-sm text-slate-900">{selectedPO.po_number}</span>
                  <Badge variant="info" dot>Approved</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedPO.supplier_name}</p>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500">Session expiry:</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{formatTimer(remainingSeconds)}</span>
              </div>
            </div>

            {checkoutSession && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 font-mono">
                <span className="flex items-center gap-1.5 font-sans text-slate-600">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Price locked
                </span>
                <span className="text-[11px] truncate max-w-xs">{checkoutSession.integrity_hash.slice(0, 24)}...</span>
              </div>
            )}

            {/* Line items */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/70 text-slate-500 text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-medium">Item</th>
                    <th className="py-2 px-3 font-medium text-center">Qty</th>
                    <th className="py-2 px-3 font-medium text-right">Unit price</th>
                    <th className="py-2 px-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPO.items.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="py-2 px-3 font-medium text-slate-900">{line.product_name}</td>
                      <td className="py-2 px-3 text-center font-medium text-slate-900 tabular-nums">{line.quantity}</td>
                      <td className="py-2 px-3 text-right text-slate-600 tabular-nums">{formatCurrency(line.unit_price)}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900 tabular-nums">{formatCurrency(line.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total calculation */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="tabular-nums">{formatCurrency(selectedPO.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%):</span>
                <span className="tabular-nums">{formatCurrency(selectedPO.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight logistics:</span>
                <span className="tabular-nums">{formatCurrency(selectedPO.shipping_amount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold text-sm text-slate-900">
                <span>Total payable:</span>
                <span className="tabular-nums">{formatCurrency(selectedPO.total_amount)}</span>
              </div>
            </div>
          </Card>

          {/* Settlement Checkout Box */}
          <Card className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-100">
                PayPal Settlement
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Settles directly to {selectedPO.supplier_name}'s verified merchant account via Orders API v2.
              </p>

              {paymentError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCompletePayment}
                    leftIcon={<RotateCcw className="w-3 h-3" />}
                    className="bg-white"
                  >
                    Retry
                  </Button>
                </div>
              )}

              <Button
                variant="paypal"
                className="w-full py-2.5 text-xs font-semibold"
                onClick={handleCompletePayment}
                isLoading={isProcessing}
              >
                Pay with PayPal Sandbox
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-0.5">
              <span className="text-slate-500 block font-medium">Gateway verification:</span>
              <p className="font-mono text-[10px]">api-m.sandbox.paypal.com</p>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center text-slate-500 bg-slate-50/40">
          <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-900">No purchase orders awaiting payment</p>
          <p className="text-xs text-slate-500 mt-1">
            New orders approved by managers will appear here for checkout.
          </p>
        </Card>
      )}

      {/* PayPal Webhook Simulation Console */}
      <Card className="p-4 border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              PayPal Orders API v2 Webhook Event Simulator
            </h3>
            <Badge variant="neutral" size="sm" className="bg-slate-800 text-slate-300 border-slate-700 font-mono text-[10px]">
              RFC 7515 Verified
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimulateWebhook('PAYMENT.CAPTURE.COMPLETED')}
              className="px-2.5 py-1 rounded-md bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[10px] font-mono transition-colors"
            >
              Dispatch PAYMENT.CAPTURE.COMPLETED
            </button>
            <button
              onClick={() => handleSimulateWebhook('CHECKOUT.ORDER.APPROVED')}
              className="px-2.5 py-1 rounded-md bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[10px] font-mono transition-colors"
            >
              Dispatch CHECKOUT.ORDER.APPROVED
            </button>
          </div>
        </div>

        {simulatedWebhook ? (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
            <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-800/80 pb-1">
              <span>Event ID: {simulatedWebhook.payload.id}</span>
              <span>Dispatched: {formatDateTime(simulatedWebhook.timestamp)}</span>
            </div>
            <pre className="text-emerald-400 overflow-x-auto text-[10px] py-1">
              {JSON.stringify(simulatedWebhook.payload, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">
            Click an event button above to simulate incoming PayPal server-to-server webhook notifications with RFC-compliant payload envelopes.
          </p>
        )}
      </Card>

      {/* Transaction History */}
      <div className="space-y-3 pt-6 border-t border-slate-200/80">
        <h3 className="text-sm font-semibold text-slate-900">Settled PayPal transactions</h3>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Capture ID</th>
                  <th className="py-2.5 px-3 font-medium">PayPal order</th>
                  <th className="py-2.5 px-3 font-medium">Payer</th>
                  <th className="py-2.5 px-3 font-medium text-right">Gross</th>
                  <th className="py-2.5 px-3 font-medium text-right">Fee</th>
                  <th className="py-2.5 px-3 font-medium text-right">Net</th>
                  <th className="py-2.5 px-3 font-medium text-center">Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/40">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{p.capture_id}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{p.paypal_order_id}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.payer_email}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900 tabular-nums">{formatCurrency(p.amount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">{formatCurrency(p.paypal_fee)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-emerald-700 tabular-nums">{formatCurrency(p.net_amount)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="success" dot size="sm">Completed</Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-500">{formatDateTime(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
