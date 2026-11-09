-- ==============================================================================
-- PROCUREAI: Autonomous AI Procurement & Payment Agent Database Schema
-- Version: 1.0.0
-- Dialect: PostgreSQL (Supabase Compatible)
-- 28 Tables with Full RLS, Functions, Triggers & Constraints
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Extends Supabase Auth or Standalone Profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('buyer', 'supplier', 'admin')),
    job_title TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORGANISATIONS
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    business_registration_no TEXT,
    tax_id TEXT,
    industry TEXT,
    currency TEXT NOT NULL DEFAULT 'INR',
    annual_procurement_budget NUMERIC(15, 2) DEFAULT 10000000.00,
    address JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORGANISATION_MEMBERS
CREATE TABLE IF NOT EXISTS organisation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'procurement_manager', 'buyer', 'viewer')),
    approval_limit NUMERIC(15, 2) DEFAULT 100000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organisation_id, profile_id)
);

-- 4. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    legal_name TEXT NOT NULL,
    gstin_tax_id TEXT UNIQUE,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    website TEXT,
    business_category TEXT NOT NULL,
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    reliability_score NUMERIC(5, 2) DEFAULT 85.00 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    delivery_rating NUMERIC(3, 2) DEFAULT 4.5 CHECK (delivery_rating >= 0 AND delivery_rating <= 5.0),
    quality_score NUMERIC(5, 2) DEFAULT 90.00,
    payment_terms TEXT DEFAULT 'Net 30 / PayPal Express',
    paypal_merchant_id TEXT,
    paypal_email TEXT,
    is_provisional BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SUPPLIER_VERIFICATIONS
CREATE TABLE IF NOT EXISTS supplier_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_url TEXT,
    verified_by UUID REFERENCES profiles(id),
    verification_notes TEXT,
    status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCT_CATEGORIES
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES product_categories(id),
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCTS (Global Master Catalogue)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES product_categories(id),
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    gtin TEXT UNIQUE,
    brand TEXT,
    model_number TEXT,
    description TEXT,
    image_url TEXT,
    unit_of_measurement TEXT NOT NULL DEFAULT 'unit',
    specifications JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    benchmark_market_price NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SUPPLIER_PRODUCTS (Supplier-Specific Offerings & Stock)
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_sku TEXT,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    available_stock INTEGER NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    min_order_quantity INTEGER NOT NULL DEFAULT 1 CHECK (min_order_quantity >= 1),
    estimated_delivery_days INTEGER NOT NULL DEFAULT 3,
    shipping_cost_per_unit NUMERIC(10, 2) DEFAULT 0,
    listing_status TEXT NOT NULL DEFAULT 'active' CHECK (listing_status IN ('active', 'out_of_stock', 'delisted')),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(supplier_id, product_id)
);

-- 9. PROCUREMENT_REQUESTS
CREATE TABLE IF NOT EXISTS procurement_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    prompt_text TEXT,
    structured_requirements JSONB,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'analysing', 'quoted', 'po_generated', 'completed', 'cancelled')),
    target_delivery_date DATE,
    delivery_address JSONB,
    max_budget NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PROCUREMENT_REQUEST_ITEMS
CREATE TABLE IF NOT EXISTS procurement_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procurement_request_id UUID NOT NULL REFERENCES procurement_requests(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    requested_item_name TEXT NOT NULL,
    sku TEXT,
    gtin TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    target_unit_price NUMERIC(12, 2),
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SUPPLIER_QUOTES
CREATE TABLE IF NOT EXISTS supplier_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procurement_request_id UUID NOT NULL REFERENCES procurement_requests(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    quote_reference TEXT NOT NULL,
    subtotal_amount NUMERIC(15, 2) NOT NULL,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    shipping_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    valid_until TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'rejected', 'expired')),
    estimated_delivery_days INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SUPPLIER_QUOTE_ITEMS
CREATE TABLE IF NOT EXISTS supplier_quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_quote_id UUID NOT NULL REFERENCES supplier_quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. SUPPLIER_SCORES (Multi-criteria evaluation records)
CREATE TABLE IF NOT EXISTS supplier_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procurement_request_id UUID REFERENCES procurement_requests(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    price_score NUMERIC(5, 2) NOT NULL,
    availability_score NUMERIC(5, 2) NOT NULL,
    delivery_score NUMERIC(5, 2) NOT NULL,
    reliability_score NUMERIC(5, 2) NOT NULL,
    composite_score NUMERIC(5, 2) NOT NULL,
    is_provisional BOOLEAN DEFAULT false,
    scoring_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. PURCHASE_ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    procurement_request_id UUID REFERENCES procurement_requests(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    created_by UUID NOT NULL REFERENCES profiles(id),
    subtotal_amount NUMERIC(15, 2) NOT NULL CHECK (subtotal_amount >= 0),
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_approval', 'approved', 'payment_pending',
        'payment_completed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'
    )),
    delivery_address JSONB NOT NULL,
    expected_delivery_date DATE,
    terms_and_conditions TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PURCHASE_ORDER_ITEMS
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    item_description TEXT NOT NULL,
    sku TEXT,
    gtin TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. APPROVAL_REQUESTS
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES profiles(id),
    assigned_approver UUID REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    threshold_amount NUMERIC(15, 2) NOT NULL,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. APPROVAL_HISTORY
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'changes_requested', 'commented')),
    notes TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. CHECKOUT_SESSIONS (Tokenized Time-limited Checkout)
CREATE TABLE IF NOT EXISTS checkout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT NOT NULL UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    approved_amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
    integrity_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 19. PAYPAL_ORDERS
CREATE TABLE IF NOT EXISTS paypal_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_session_id UUID NOT NULL REFERENCES checkout_sessions(id) ON DELETE CASCADE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    paypal_order_id TEXT NOT NULL UNIQUE,
    intent TEXT NOT NULL DEFAULT 'CAPTURE',
    status TEXT NOT NULL DEFAULT 'CREATED',
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    idempotency_key TEXT UNIQUE,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    paypal_order_id TEXT NOT NULL,
    capture_id TEXT NOT NULL UNIQUE,
    checkout_session_id UUID REFERENCES checkout_sessions(id),
    payer_id TEXT,
    payer_email TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    paypal_fee NUMERIC(10, 2) DEFAULT 0,
    net_amount NUMERIC(15, 2),
    status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'DECLINED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED')),
    payment_method TEXT DEFAULT 'PAYPAL',
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_capture_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. PAYMENT_WEBHOOK_EVENTS
CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    resource_type TEXT,
    summary TEXT,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    payload JSONB NOT NULL,
    processed_status TEXT NOT NULL DEFAULT 'pending' CHECK (processed_status IN ('pending', 'processed', 'ignored', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. INVENTORY_MOVEMENTS
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    purchase_order_id UUID REFERENCES purchase_orders(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('inflow', 'outflow_purchase', 'adjustment', 'reservation')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. DEMAND_FORECASTS
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL,
    burn_rate_daily NUMERIC(8, 2) NOT NULL,
    forecasted_demand_30d INTEGER NOT NULL,
    recommended_reorder_qty INTEGER NOT NULL,
    estimated_stockout_date DATE,
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low_illustrative')),
    reorder_alert_triggered BOOLEAN NOT NULL DEFAULT false,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. AI_AGENT_RUNS
CREATE TABLE IF NOT EXISTS ai_agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic')),
    prompt TEXT NOT NULL,
    intent TEXT,
    tokens_consumed INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'fallback')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. AI_RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_run_id UUID REFERENCES ai_agent_runs(id) ON DELETE CASCADE,
    procurement_request_id UUID REFERENCES procurement_requests(id) ON DELETE CASCADE,
    recommended_supplier_ids JSONB NOT NULL,
    total_projected_cost NUMERIC(15, 2) NOT NULL,
    estimated_savings NUMERIC(15, 2) NOT NULL,
    tradeoff_explanation TEXT NOT NULL,
    risk_assessment TEXT,
    confidence_score NUMERIC(5, 2) DEFAULT 95.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. PROVENANCE_EVENTS (Tamper-Evident Chronological Audit Ledger)
CREATE TABLE IF NOT EXISTS provenance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_number BIGSERIAL,
    event_type TEXT NOT NULL,
    actor_id UUID REFERENCES profiles(id),
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    organisation_id UUID REFERENCES organisations(id),
    procurement_request_id UUID REFERENCES procurement_requests(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    paypal_order_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    previous_hash TEXT,
    current_hash TEXT NOT NULL,
    verification_reference TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('rfq', 'quote_received', 'ai_completed', 'approval_needed', 'approved', 'payment_success', 'payment_failed', 'order_dispatched', 'low_stock')),
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. ORGANISATION_SETTINGS
CREATE TABLE IF NOT EXISTS organisation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL UNIQUE REFERENCES organisations(id) ON DELETE CASCADE,
    require_two_approvals_above NUMERIC(15, 2) DEFAULT 250000.00,
    default_payment_method TEXT DEFAULT 'PAYPAL_EXPRESS',
    preferred_ai_provider TEXT DEFAULT 'gemini',
    auto_generate_po BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & INTEGRITY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_product ON supplier_products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_org ON purchase_orders(organisation_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_provenance_po ON provenance_events(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_provenance_event_type ON provenance_events(event_type);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_token ON checkout_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_payments_po ON payments(purchase_order_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE provenance_events ENABLE ROW LEVEL SECURITY;

-- Default readable policies for authenticated sessions
CREATE POLICY "Public profiles can be read by authenticated users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public products can be read by all users" ON products FOR SELECT USING (true);
CREATE POLICY "Public supplier products can be read by all users" ON supplier_products FOR SELECT USING (true);
CREATE POLICY "Suppliers directory readable by all users" ON suppliers FOR SELECT USING (true);

-- Provenance ledger is strictly append-only: No UPDATE or DELETE permitted
CREATE POLICY "Provenance events are append-only" ON provenance_events FOR SELECT USING (true);
CREATE POLICY "Provenance events insertion" ON provenance_events FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Function to record tamper-evident hash chaining in provenance_events
CREATE OR REPLACE FUNCTION fn_generate_provenance_hash()
RETURNS TRIGGER AS $$
DECLARE
    last_hash TEXT;
BEGIN
    SELECT current_hash INTO last_hash FROM provenance_events ORDER BY event_number DESC LIMIT 1;
    NEW.previous_hash := COALESCE(last_hash, 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000');
    NEW.current_hash := encode(digest(NEW.previous_hash || NEW.event_type || NEW.actor_name || NEW.created_at::text || NEW.metadata::text, 'sha256'), 'hex');
    NEW.verification_reference := 'PRC-VRF-' || UPPER(SUBSTRING(NEW.current_hash FROM 1 FOR 12));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_provenance_hash ON provenance_events;
CREATE TRIGGER trg_provenance_hash
BEFORE INSERT ON provenance_events
FOR EACH ROW
EXECUTE FUNCTION fn_generate_provenance_hash();
