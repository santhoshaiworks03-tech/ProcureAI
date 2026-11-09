import {
  Organisation,
  Profile,
  Supplier,
  ProductCategory,
  Product,
  SupplierProduct,
  PurchaseOrder,
  PurchaseOrderStatus,
  ApprovalRequest,
  CheckoutSession,
  PaymentRecord,
  ProvenanceEvent,
  DemandForecast,
  NotificationItem,
  UserRole
} from '../types';

import {
  SEED_ORGANISATIONS,
  SEED_PROFILES,
  SEED_SUPPLIERS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_SUPPLIER_PRODUCTS,
  SEED_PURCHASE_ORDERS,
  SEED_DEMAND_FORECASTS,
  SEED_PROVENANCE_EVENTS,
  SEED_NOTIFICATIONS
} from './seedData';

// Helper to calculate SHA-256 hex string in browser
export async function calculateSha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class ReactiveDataStore {
  private organisations: Organisation[];
  private profiles: Profile[];
  private currentProfileId: string;
  private currentRole: UserRole;
  private suppliers: Supplier[];
  private categories: ProductCategory[];
  private products: Product[];
  private supplierProducts: SupplierProduct[];
  private purchaseOrders: PurchaseOrder[];
  private approvalRequests: ApprovalRequest[];
  private checkoutSessions: CheckoutSession[];
  private payments: PaymentRecord[];
  private provenanceEvents: ProvenanceEvent[];
  private demandForecasts: DemandForecast[];
  private notifications: NotificationItem[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.organisations = this.load('procureai_orgs', SEED_ORGANISATIONS);
    this.profiles = this.load('procureai_profiles', SEED_PROFILES);
    this.currentProfileId = localStorage.getItem('procureai_active_profile') || 'usr-buyer-01';
    this.currentRole = (localStorage.getItem('procureai_active_role') as UserRole) || 'buyer';
    this.suppliers = this.load('procureai_suppliers', SEED_SUPPLIERS);
    this.categories = this.load('procureai_categories', SEED_CATEGORIES);
    this.products = this.load('procureai_products', SEED_PRODUCTS);
    this.supplierProducts = this.load('procureai_supplier_products', SEED_SUPPLIER_PRODUCTS);
    this.purchaseOrders = this.load('procureai_purchase_orders', SEED_PURCHASE_ORDERS);
    this.demandForecasts = this.load('procureai_demand_forecasts', SEED_DEMAND_FORECASTS);
    this.provenanceEvents = this.load('procureai_provenance_events', SEED_PROVENANCE_EVENTS);
    this.notifications = this.load('procureai_notifications', SEED_NOTIFICATIONS);
    this.checkoutSessions = this.load('procureai_checkout_sessions', []);
    this.payments = this.load('procureai_payments', []);
    this.approvalRequests = this.load('procureai_approval_requests', this.generateInitialApprovals());
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`Error loading ${key} from localStorage, using fallback:`, e);
      return fallback;
    }
  }

  private save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private generateInitialApprovals(): ApprovalRequest[] {
    return this.purchaseOrders
      .filter(po => po.status === 'pending_approval' || po.status === 'approved')
      .map(po => ({
        id: `appr-${po.id}`,
        purchase_order_id: po.id,
        purchase_order: po,
        requested_by: po.created_by,
        requested_by_name: po.created_by_name || 'Procurement Officer',
        status: po.status === 'approved' ? 'approved' : 'pending',
        threshold_amount: 250000,
        comments: 'Standard approval request for business requirement.',
        created_at: po.created_at,
        updated_at: po.updated_at,
        history: [
          {
            actor_name: po.created_by_name || 'Procurement Officer',
            action: 'SUBMITTED',
            notes: 'Generated from AI Procurement Workspace',
            created_at: po.created_at
          }
        ]
      }));
  }

  // --- Profile & Role Switcher ---
  public getCurrentUser(): Profile {
    const found = this.profiles.find(p => p.id === this.currentProfileId);
    if (found) {
      return { ...found, role: this.currentRole };
    }
    return { ...SEED_PROFILES[0], role: this.currentRole };
  }

  public setRole(role: UserRole) {
    this.currentRole = role;
    localStorage.setItem('procureai_active_role', role);
    if (role === 'buyer') this.currentProfileId = 'usr-buyer-01';
    else if (role === 'supplier') this.currentProfileId = 'usr-supplier-01';
    else if (role === 'admin') this.currentProfileId = 'usr-admin-01';
    localStorage.setItem('procureai_active_profile', this.currentProfileId);
    this.notify();
  }

  public getActiveOrganisation(): Organisation {
    return this.organisations[0];
  }

  // --- Products & Categories ---
  public getCategories(): ProductCategory[] {
    return [...this.categories];
  }

  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public addProduct(product: Omit<Product, 'id' | 'created_at'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.products.unshift(newProduct);
    this.save('procureai_products', this.products);
    return newProduct;
  }

  // --- Suppliers & Listings ---
  public getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  public getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find(s => s.id === id);
  }

  public updateSupplierVerification(supplierId: string, status: Supplier['verification_status']): void {
    this.suppliers = this.suppliers.map(s => (s.id === supplierId ? { ...s, verification_status: status } : s));
    this.save('procureai_suppliers', this.suppliers);
  }

  public getSupplierProducts(): SupplierProduct[] {
    return this.supplierProducts.map(sp => ({
      ...sp,
      product: this.products.find(p => p.id === sp.product_id)
    }));
  }

  public getListingsForProduct(productId: string): SupplierProduct[] {
    return this.getSupplierProducts().filter(sp => sp.product_id === productId);
  }

  public addSupplierProduct(sp: Omit<SupplierProduct, 'id' | 'last_updated'>): SupplierProduct {
    const newListing: SupplierProduct = {
      ...sp,
      id: `sp-${Date.now()}`,
      last_updated: new Date().toISOString()
    };
    this.supplierProducts.push(newListing);
    this.save('procureai_supplier_products', this.supplierProducts);
    return newListing;
  }

  // --- Purchase Orders ---
  public getPurchaseOrders(): PurchaseOrder[] {
    return [...this.purchaseOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getPurchaseOrderById(id: string): PurchaseOrder | undefined {
    return this.purchaseOrders.find(po => po.id === id || po.po_number === id);
  }

  public async createPurchaseOrder(poData: Omit<PurchaseOrder, 'id' | 'po_number' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const count = this.purchaseOrders.length + 893;
    const poNumber = `PO-2024-${count.toString().padStart(4, '0')}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      po_number: poNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.purchaseOrders.unshift(newPO);
    this.save('procureai_purchase_orders', this.purchaseOrders);

    // Create corresponding approval request if status is pending_approval
    if (newPO.status === 'pending_approval') {
      const approval: ApprovalRequest = {
        id: `appr-${newPO.id}`,
        purchase_order_id: newPO.id,
        purchase_order: newPO,
        requested_by: newPO.created_by,
        requested_by_name: newPO.created_by_name || 'Procurement Buyer',
        status: 'pending',
        threshold_amount: 250000,
        comments: `Procurement order for ${newPO.items.length} line items from ${newPO.supplier_name}.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        history: [
          {
            actor_name: newPO.created_by_name || 'Procurement Buyer',
            action: 'SUBMITTED',
            notes: 'Created via Autonomous AI Procurement Agent',
            created_at: new Date().toISOString()
          }
        ]
      };
      this.approvalRequests.unshift(approval);
      this.save('procureai_approval_requests', this.approvalRequests);
    }

    // Append to Provenance Ledger
    await this.appendProvenanceEvent({
      event_type: 'PURCHASE_ORDER_GENERATED',
      actor_name: this.getCurrentUser().full_name,
      actor_role: this.getCurrentUser().role,
      organisation_id: newPO.organisation_id,
      purchase_order_id: newPO.id,
      po_number: newPO.po_number,
      metadata: {
        supplier: newPO.supplier_name,
        totalAmount: newPO.total_amount,
        itemsCount: newPO.items.length,
        itemsSummary: newPO.items.map(i => `${i.product_name} (x${i.quantity})`)
      }
    });

    return newPO;
  }

  public async updatePurchaseOrderStatus(poId: string, status: PurchaseOrderStatus, metadata?: Record<string, any>): Promise<PurchaseOrder | undefined> {
    const po = this.purchaseOrders.find(p => p.id === poId || p.po_number === poId);
    if (!po) return undefined;

    po.status = status;
    po.updated_at = new Date().toISOString();
    this.save('procureai_purchase_orders', this.purchaseOrders);

    await this.appendProvenanceEvent({
      event_type: `PO_STATUS_${status.toUpperCase()}`,
      actor_name: this.getCurrentUser().full_name,
      actor_role: this.getCurrentUser().role,
      organisation_id: po.organisation_id,
      purchase_order_id: po.id,
      po_number: po.po_number,
      metadata: {
        newStatus: status,
        ...metadata
      }
    });

    return po;
  }

  // --- Approvals ---
  public getApprovalRequests(): ApprovalRequest[] {
    return this.approvalRequests.map(ar => ({
      ...ar,
      purchase_order: this.purchaseOrders.find(p => p.id === ar.purchase_order_id)
    }));
  }

  public async approvePurchaseOrder(approvalId: string, notes?: string): Promise<ApprovalRequest | undefined> {
    const approval = this.approvalRequests.find(a => a.id === approvalId);
    if (!approval) return undefined;

    approval.status = 'approved';
    approval.updated_at = new Date().toISOString();
    approval.history = approval.history || [];
    approval.history.push({
      actor_name: this.getCurrentUser().full_name,
      action: 'APPROVED',
      notes: notes || 'Authorized for procurement checkout.',
      created_at: new Date().toISOString()
    });

    this.save('procureai_approval_requests', this.approvalRequests);
    await this.updatePurchaseOrderStatus(approval.purchase_order_id, 'approved', { approver: this.getCurrentUser().full_name, notes });

    await this.appendProvenanceEvent({
      event_type: 'HUMAN_APPROVAL_GRANTED',
      actor_name: this.getCurrentUser().full_name,
      actor_role: this.getCurrentUser().role,
      purchase_order_id: approval.purchase_order_id,
      po_number: approval.purchase_order?.po_number,
      metadata: {
        approvalNotes: notes || 'Verified budget authorization by authorized manager.'
      }
    });

    return approval;
  }

  public async rejectPurchaseOrder(approvalId: string, reason: string): Promise<ApprovalRequest | undefined> {
    const approval = this.approvalRequests.find(a => a.id === approvalId);
    if (!approval) return undefined;

    approval.status = 'rejected';
    approval.updated_at = new Date().toISOString();
    approval.history = approval.history || [];
    approval.history.push({
      actor_name: this.getCurrentUser().full_name,
      action: 'REJECTED',
      notes: reason,
      created_at: new Date().toISOString()
    });

    this.save('procureai_approval_requests', this.approvalRequests);
    await this.updatePurchaseOrderStatus(approval.purchase_order_id, 'rejected', { reason });

    await this.appendProvenanceEvent({
      event_type: 'HUMAN_APPROVAL_REJECTED',
      actor_name: this.getCurrentUser().full_name,
      actor_role: this.getCurrentUser().role,
      purchase_order_id: approval.purchase_order_id,
      po_number: approval.purchase_order?.po_number,
      metadata: { reason }
    });

    return approval;
  }

  // --- Tokenized Checkout Sessions (5-min Expiry) ---
  public async createCheckoutSession(poId: string): Promise<CheckoutSession> {
    const po = this.getPurchaseOrderById(poId);
    if (!po) throw new Error('Purchase order not found');

    if (po.status !== 'approved' && po.status !== 'payment_pending') {
      throw new Error(`Cannot start checkout for order in status: ${po.status}. Order must be approved first.`);
    }

    const sessionToken = `sess_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    // Expiration: 5 minutes from now (300 seconds)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const rawIntegrityString = `${sessionToken}:${po.id}:${po.total_amount}:${po.currency}:${expiresAt}`;
    const integrityHash = await calculateSha256(rawIntegrityString);

    const session: CheckoutSession = {
      id: `cs-${Date.now()}`,
      session_token: sessionToken,
      purchase_order_id: po.id,
      purchase_order: po,
      organisation_id: po.organisation_id,
      buyer_id: this.currentProfileId,
      approved_amount: po.total_amount,
      currency: po.currency,
      expires_at: expiresAt,
      status: 'active',
      integrity_hash: integrityHash,
      created_at: new Date().toISOString()
    };

    this.checkoutSessions.push(session);
    this.save('procureai_checkout_sessions', this.checkoutSessions);

    await this.updatePurchaseOrderStatus(po.id, 'payment_pending');

    await this.appendProvenanceEvent({
      event_type: 'TOKENIZED_CHECKOUT_SESSION_CREATED',
      actor_name: this.getCurrentUser().full_name,
      actor_role: this.getCurrentUser().role,
      purchase_order_id: po.id,
      po_number: po.po_number,
      metadata: {
        sessionToken,
        expiresInSeconds: 300,
        approvedAmount: po.total_amount,
        currency: po.currency
      }
    });

    return session;
  }

  public getCheckoutSession(sessionIdOrToken: string): CheckoutSession | undefined {
    return this.checkoutSessions.find(
      s => (s.id === sessionIdOrToken || s.session_token === sessionIdOrToken) && s.status === 'active'
    );
  }

  // --- Payment Processing & Verification ---
  public async recordPayment(params: {
    purchaseOrderId: string;
    paypalOrderId: string;
    captureId: string;
    checkoutSessionId?: string;
    amount: number;
    currency: string;
    payerEmail?: string;
    rawResponse?: any;
  }): Promise<PaymentRecord> {
    const po = this.getPurchaseOrderById(params.purchaseOrderId);
    if (!po) throw new Error('Purchase order not found');

    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      purchase_order_id: po.id,
      paypal_order_id: params.paypalOrderId,
      capture_id: params.captureId,
      checkout_session_id: params.checkoutSessionId,
      payer_id: 'PAYER-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      payer_email: params.payerEmail || this.getCurrentUser().email,
      amount: params.amount,
      currency: params.currency,
      paypal_fee: Math.round(params.amount * 0.025), // 2.5% standard fee
      net_amount: Math.round(params.amount * 0.975),
      status: 'COMPLETED',
      payment_method: 'PAYPAL_EXPRESS',
      verified_at: new Date().toISOString(),
      raw_capture_response: params.rawResponse || { status: 'COMPLETED', verified: true },
      created_at: new Date().toISOString()
    };

    this.payments.unshift(payment);
    this.save('procureai_payments', this.payments);

    // Update PO status
    po.status = 'payment_completed';
    po.payment_reference = params.captureId;
    po.updated_at = new Date().toISOString();
    this.save('procureai_purchase_orders', this.purchaseOrders);

    // Mark checkout session as completed
    if (params.checkoutSessionId) {
      const sess = this.checkoutSessions.find(s => s.id === params.checkoutSessionId);
      if (sess) {
        sess.status = 'completed';
        sess.completed_at = new Date().toISOString();
        this.save('procureai_checkout_sessions', this.checkoutSessions);
      }
    }

    // Append to Provenance Ledger
    await this.appendProvenanceEvent({
      event_type: 'PAYPAL_PAYMENT_CAPTURED',
      actor_name: 'PayPal Sandbox Gateway',
      actor_role: 'system',
      purchase_order_id: po.id,
      po_number: po.po_number,
      paypal_order_id: params.paypalOrderId,
      metadata: {
        captureId: params.captureId,
        amount: params.amount,
        currency: params.currency,
        payerEmail: payment.payer_email,
        fee: payment.paypal_fee,
        netSettled: payment.net_amount
      }
    });

    // Notify Buyer
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient_profile_id: this.currentProfileId,
      title: `Payment Verified: ${po.po_number}`,
      message: `PayPal Sandbox capture ${params.captureId} successfully settled for ₹${params.amount.toLocaleString('en-IN')}.`,
      type: 'payment_success',
      link_url: `/orders`,
      is_read: false,
      created_at: new Date().toISOString()
    });
    this.save('procureai_notifications', this.notifications);

    return payment;
  }

  public getPayments(): PaymentRecord[] {
    return [...this.payments];
  }

  // --- Provenance Ledger (Tamper-Evident SHA-256 Hash Chaining) ---
  public getProvenanceEvents(): ProvenanceEvent[] {
    return [...this.provenanceEvents].sort((a, b) => b.event_number - a.event_number);
  }

  public async appendProvenanceEvent(data: {
    event_type: string;
    actor_name: string;
    actor_role: string;
    organisation_id?: string;
    purchase_order_id?: string;
    po_number?: string;
    paypal_order_id?: string;
    metadata: Record<string, any>;
  }): Promise<ProvenanceEvent> {
    const lastEvent = this.provenanceEvents[this.provenanceEvents.length - 1];
    const previousHash = lastEvent ? lastEvent.current_hash : 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000';
    const eventNumber = (lastEvent ? lastEvent.event_number : 0) + 1;
    const createdAt = new Date().toISOString();

    const payloadToHash = `${previousHash}|${eventNumber}|${data.event_type}|${data.actor_name}|${createdAt}|${JSON.stringify(data.metadata)}`;
    const currentHash = await calculateSha256(payloadToHash);
    const verificationReference = `PRC-VRF-${currentHash.substring(0, 12).toUpperCase()}`;

    const newEvent: ProvenanceEvent = {
      id: `prv-${Date.now()}-${eventNumber}`,
      event_number: eventNumber,
      event_type: data.event_type,
      actor_name: data.actor_name,
      actor_role: data.actor_role,
      organisation_id: data.organisation_id || this.getActiveOrganisation().id,
      purchase_order_id: data.purchase_order_id,
      po_number: data.po_number,
      paypal_order_id: data.paypal_order_id,
      metadata: data.metadata,
      previous_hash: previousHash,
      current_hash: currentHash,
      verification_reference: verificationReference,
      created_at: createdAt
    };

    this.provenanceEvents.push(newEvent);
    this.save('procureai_provenance_events', this.provenanceEvents);
    return newEvent;
  }

  // --- Demand Forecasts ---
  public getDemandForecasts(): DemandForecast[] {
    return [...this.demandForecasts];
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map(n => (n.id === id ? { ...n, is_read: true } : n));
    this.save('procureai_notifications', this.notifications);
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, is_read: true }));
    this.save('procureai_notifications', this.notifications);
  }

  // --- Reset to Initial State ---
  public resetToSeedData() {
    localStorage.removeItem('procureai_orgs');
    localStorage.removeItem('procureai_profiles');
    localStorage.removeItem('procureai_suppliers');
    localStorage.removeItem('procureai_categories');
    localStorage.removeItem('procureai_products');
    localStorage.removeItem('procureai_supplier_products');
    localStorage.removeItem('procureai_purchase_orders');
    localStorage.removeItem('procureai_approval_requests');
    localStorage.removeItem('procureai_checkout_sessions');
    localStorage.removeItem('procureai_payments');
    localStorage.removeItem('procureai_provenance_events');
    localStorage.removeItem('procureai_demand_forecasts');
    localStorage.removeItem('procureai_notifications');

    this.organisations = [...SEED_ORGANISATIONS];
    this.profiles = [...SEED_PROFILES];
    this.suppliers = [...SEED_SUPPLIERS];
    this.categories = [...SEED_CATEGORIES];
    this.products = [...SEED_PRODUCTS];
    this.supplierProducts = [...SEED_SUPPLIER_PRODUCTS];
    this.purchaseOrders = [...SEED_PURCHASE_ORDERS];
    this.demandForecasts = [...SEED_DEMAND_FORECASTS];
    this.provenanceEvents = [...SEED_PROVENANCE_EVENTS];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.approvalRequests = this.generateInitialApprovals();
    this.checkoutSessions = [];
    this.payments = [];
    this.notify();
  }
}

export const store = new ReactiveDataStore();

