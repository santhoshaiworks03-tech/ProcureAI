export type UserRole = 'buyer' | 'supplier' | 'admin';

export interface Profile {
  id: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  job_title?: string;
  is_active: boolean;
  created_at: string;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  business_registration_no?: string;
  tax_id?: string;
  industry?: string;
  currency: string;
  annual_procurement_budget: number;
  spent_budget?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  is_verified: boolean;
  created_at: string;
}

export interface OrganisationMember {
  id: string;
  organisation_id: string;
  profile_id: string;
  role: 'owner' | 'admin' | 'procurement_manager' | 'buyer' | 'viewer';
  approval_limit: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  organisation_id?: string;
  company_name: string;
  legal_name: string;
  gstin_tax_id: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  business_category: string;
  address: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postal_code?: string;
  };
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
  reliability_score: number;
  delivery_rating: number;
  quality_score: number;
  payment_terms: string;
  paypal_merchant_id?: string;
  paypal_email?: string;
  is_provisional: boolean;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  sku: string;
  gtin?: string;
  brand: string;
  model_number?: string;
  description: string;
  image_url: string;
  unit_of_measurement: string;
  specifications: Record<string, string | number>;
  benchmark_market_price: number;
  is_active: boolean;
  created_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  product_id: string;
  product?: Product;
  supplier_sku: string;
  unit_price: number;
  currency: string;
  available_stock: number;
  min_order_quantity: number;
  estimated_delivery_days: number;
  shipping_cost_per_unit: number;
  listing_status: 'active' | 'out_of_stock' | 'delisted';
  last_updated: string;
}

export interface ProcurementRequirementItem {
  id: string;
  itemName: string;
  sku?: string;
  gtin?: string;
  quantity: number;
  specifications?: Record<string, any>;
  targetUnitPrice?: number;
  matchedProductId?: string;
  matchedProductName?: string;
}

export interface ExtractedProcurementPlan {
  title: string;
  items: ProcurementRequirementItem[];
  maxBudget: number;
  currency: string;
  targetDeliveryDate?: string;
  deliveryLocation?: string;
  preferredSupplier?: string;
  needsClarification?: boolean;
  clarificationQuestions?: string[];
  budgetSpecified?: boolean;
}

export interface SupplierEvaluation {
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  quantityAvailable: number;
  deliveryDays: number;
  minOrderQty: number;
  verificationStatus: string;
  priceScore: number;
  availabilityScore: number;
  deliveryScore: number;
  reliabilityScore: number;
  compositeScore: number;
  isProvisional: boolean;
  matchScoreExplanation: string;
}

export interface ProcurementRecommendation {
  id: string;
  procurementRequestId?: string;
  selectedSuppliers: {
    supplierId: string;
    supplierName: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    deliveryDays: number;
  }[];
  totalProjectedCost: number;
  estimatedSavings: number;
  budgetUtilizationPercentage: number;
  tradeoffExplanation: string;
  riskAssessment: string;
  alternativeOptionsNote?: string;
  confidenceScore: number;
  generatedAt: string;
}

export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'payment_pending'
  | 'payment_completed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  product_name: string;
  sku?: string;
  gtin?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  organisation_id: string;
  organisation_name?: string;
  procurement_request_id?: string;
  supplier_id: string;
  supplier_name: string;
  created_by: string;
  created_by_name?: string;
  subtotal_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  delivery_address: {
    recipient_name: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  expected_delivery_date: string;
  terms_and_conditions: string;
  payment_reference?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  purchase_order_id: string;
  purchase_order?: PurchaseOrder;
  requested_by: string;
  requested_by_name: string;
  assigned_approver?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  threshold_amount: number;
  comments?: string;
  created_at: string;
  updated_at: string;
  history?: {
    actor_name: string;
    action: string;
    notes?: string;
    created_at: string;
  }[];
}

export interface CheckoutSession {
  id: string;
  session_token: string;
  purchase_order_id: string;
  purchase_order?: PurchaseOrder;
  organisation_id: string;
  buyer_id: string;
  approved_amount: number;
  currency: string;
  expires_at: string; // ISO timestamp
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  integrity_hash: string;
  created_at: string;
  completed_at?: string;
}

export interface PayPalOrderRecord {
  id: string;
  checkout_session_id: string;
  purchase_order_id: string;
  paypal_order_id: string;
  intent: string;
  status: string;
  amount: number;
  currency: string;
  idempotency_key: string;
  raw_response?: any;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  purchase_order_id: string;
  paypal_order_id: string;
  capture_id: string;
  checkout_session_id?: string;
  payer_id?: string;
  payer_email?: string;
  amount: number;
  currency: string;
  paypal_fee: number;
  net_amount: number;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'FAILED';
  payment_method: string;
  verified_at: string;
  raw_capture_response?: any;
  created_at: string;
}

export interface ProvenanceEvent {
  id: string;
  event_number: number;
  event_type: string;
  actor_id?: string;
  actor_name: string;
  actor_role: string;
  organisation_id?: string;
  procurement_request_id?: string;
  purchase_order_id?: string;
  po_number?: string;
  paypal_order_id?: string;
  metadata: Record<string, any>;
  previous_hash: string;
  current_hash: string;
  verification_reference: string;
  created_at: string;
}

export interface DemandForecast {
  id: string;
  organisation_id: string;
  product_id: string;
  product_name: string;
  category: string;
  current_stock: number;
  burn_rate_daily: number;
  forecasted_demand_30d: number;
  recommended_reorder_qty: number;
  estimated_stockout_date: string;
  confidence_level: 'high' | 'medium' | 'low_illustrative';
  reorder_alert_triggered: boolean;
  generated_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_profile_id: string;
  title: string;
  message: string;
  type: 'rfq' | 'quote_received' | 'ai_completed' | 'approval_needed' | 'approved' | 'payment_success' | 'payment_failed' | 'order_dispatched' | 'low_stock';
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AIAgentChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structuredPlan?: ExtractedProcurementPlan;
  recommendation?: ProcurementRecommendation;
  associatedPO?: PurchaseOrder;
  statusTimeline?: {
    step: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    details?: string;
  }[];
}

export interface SupplierRFQ {
  id: string;
  rfq_number: string;
  organisation_id: string;
  organisation_name: string;
  target_supplier_id?: string;
  title: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    target_price: number;
    specifications?: string;
  }[];
  max_budget: number;
  delivery_deadline: string;
  delivery_location: string;
  status: 'pending' | 'quoted' | 'rejected' | 'accepted';
  created_at: string;
}

export interface SupplierQuotation {
  id: string;
  rfq_id: string;
  rfq_number: string;
  supplier_id: string;
  supplier_name: string;
  quoted_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  delivery_days: number;
  status: 'submitted' | 'accepted' | 'declined' | 'under_review';
  valid_until: string;
  notes?: string;
  created_at: string;
}


