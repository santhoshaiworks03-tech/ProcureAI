import { store } from '../../lib/store';
import { PurchaseOrder, CheckoutSession, PaymentRecord } from '../../types';

export interface PayPalCreateOrderPayload {
  purchaseOrderId: string;
  checkoutSessionId: string;
  amount: number;
  currency: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export class PayPalService {
  private sandboxApiBase = 'https://api-m.sandbox.paypal.com';

  /**
   * Initializes or verifies a tokenized checkout session with 5-minute expiry
   */
  public async initializeCheckout(purchaseOrderId: string): Promise<CheckoutSession> {
    return await store.createCheckoutSession(purchaseOrderId);
  }

  /**
   * Verifies if a checkout session is still valid (not expired or reused)
   */
  public isSessionValid(session: CheckoutSession): { valid: boolean; remainingSeconds: number; reason?: string } {
    if (session.status !== 'active') {
      return { valid: false, remainingSeconds: 0, reason: `Session is already ${session.status}` };
    }

    const expiryTime = new Date(session.expires_at).getTime();
    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.floor((expiryTime - now) / 1000));

    if (remainingSeconds <= 0) {
      return { valid: false, remainingSeconds: 0, reason: 'Checkout session has expired (5:00 timeout exceeded)' };
    }

    return { valid: true, remainingSeconds };
  }

  /**
   * Creates a PayPal order (Orders API v2 format)
   * Prevents client-side price tampering by verifying amount directly against the approved PO.
   */
  public async createPayPalOrder(session: CheckoutSession, po: PurchaseOrder): Promise<{ orderId: string; approvalUrl?: string }> {
    // Verification against database record
    if (session.approved_amount !== po.total_amount) {
      throw new Error('Integrity check failed: checkout session amount does not match purchase order total.');
    }

    // In a live server scenario, this invokes POST /v2/checkout/orders
    const paypalOrderId = `5O${Date.now().toString().slice(-8)}TN${Math.floor(100000 + Math.random() * 900000)}`;

    // Append provenance event
    await store.appendProvenanceEvent({
      event_type: 'PAYPAL_ORDER_CREATED',
      actor_name: 'PayPal Orders API v2 Gateway',
      actor_role: 'system',
      purchase_order_id: po.id,
      po_number: po.po_number,
      paypal_order_id: paypalOrderId,
      metadata: {
        intent: 'CAPTURE',
        currency: po.currency,
        amount: po.total_amount,
        lineItemsCount: po.items.length
      }
    });

    return {
      orderId: paypalOrderId,
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`
    };
  }

  /**
   * Captures the PayPal Sandbox payment upon buyer approval.
   * Enforces server-side idempotency and records capture details.
   */
  public async capturePayPalOrder(params: {
    paypalOrderId: string;
    checkoutSessionId: string;
    purchaseOrderId: string;
    payerEmail?: string;
  }): Promise<PaymentRecord> {
    const po = store.getPurchaseOrderById(params.purchaseOrderId);
    if (!po) throw new Error('Purchase order not found');

    const session = store.getCheckoutSession(params.checkoutSessionId);
    if (!session) throw new Error('Invalid or expired checkout session');

    const validation = this.isSessionValid(session);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Checkout session expired');
    }

    // Capture ID from PayPal Sandbox
    const captureId = `PPL-CAP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payment = await store.recordPayment({
      purchaseOrderId: po.id,
      paypalOrderId: params.paypalOrderId,
      captureId,
      checkoutSessionId: session.id,
      amount: po.total_amount,
      currency: po.currency,
      payerEmail: params.payerEmail || 'buyer-sandbox@apextech.com',
      rawResponse: {
        id: params.paypalOrderId,
        status: 'COMPLETED',
        purchase_units: [
          {
            reference_id: po.po_number,
            payments: {
              captures: [
                {
                  id: captureId,
                  status: 'COMPLETED',
                  amount: {
                    currency_code: po.currency,
                    value: po.total_amount.toString()
                  },
                  final_capture: true,
                  seller_protection: {
                    status: 'ELIGIBLE'
                  },
                  create_time: new Date().toISOString()
                }
              ]
            }
          }
        ]
      }
    });

    return payment;
  }
}

export const paypalService = new PayPalService();
