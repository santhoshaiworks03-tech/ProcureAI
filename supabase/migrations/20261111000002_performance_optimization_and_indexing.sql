-- ==============================================================================
-- PROCUREAI HIGH-PERFORMANCE DATABASE INDEXING & QUERY OPTIMIZATION MIGRATION
-- Migration: 20261111000002_performance_optimization_and_indexing.sql
-- Optimizes query performance, eliminates table scans, accelerates RLS evaluation,
-- and provides optimized database RPC functions for high-concurrency dashboards.
-- ==============================================================================

-- 1. COMPOSITE & COVERING INDEXES FOR PRODUCTS & CATALOGUE SEARCH
-- Accelerates filtering by category and active status simultaneously
CREATE INDEX IF NOT EXISTS idx_products_category_active 
  ON products(category_id, is_active) 
  INCLUDE (id, name, sku, brand, benchmark_market_price);

-- Accelerates brand filtering
CREATE INDEX IF NOT EXISTS idx_products_brand 
  ON products(brand) 
  WHERE is_active = true;

-- Accelerates SKU and GTIN direct lookups
CREATE INDEX IF NOT EXISTS idx_products_sku 
  ON products(sku);

CREATE INDEX IF NOT EXISTS idx_products_gtin 
  ON products(gtin) 
  WHERE gtin IS NOT NULL;

-- 2. COMPOSITE INDEXES FOR SUPPLIER PRODUCTS & PRICING LOOKUPS
-- Critical for $O(1)$ pricing range calculations across contracted suppliers
CREATE INDEX IF NOT EXISTS idx_supplier_products_product_price 
  ON supplier_products(product_id, unit_price ASC) 
  INCLUDE (supplier_id, available_stock, min_order_quantity, listing_status);

-- Accelerates supplier-specific catalogue management
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_status 
  ON supplier_products(supplier_id, listing_status);

-- 3. INDEXES FOR PURCHASE ORDERS & TRANSACTION WORKFLOWS
-- Accelerates buyer and admin dashboard order listing and status filtering
CREATE INDEX IF NOT EXISTS idx_purchase_orders_org_created 
  ON purchase_orders(organisation_id, created_at DESC) 
  INCLUDE (po_number, total_amount, status, supplier_name);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_status 
  ON purchase_orders(supplier_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id 
  ON purchase_order_items(purchase_order_id) 
  INCLUDE (product_id, quantity, unit_price, total_price);

-- 4. INDEXES FOR APPROVAL WORKFLOWS & PAYMENTS
CREATE INDEX IF NOT EXISTS idx_approval_requests_po_status 
  ON approval_requests(purchase_order_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_po_status 
  ON payments(purchase_order_id, status) 
  INCLUDE (amount, currency, paypal_order_id, capture_id);

CREATE INDEX IF NOT EXISTS idx_checkout_sessions_token_status 
  ON checkout_sessions(session_token, status) 
  INCLUDE (expires_at, approved_amount);

-- 5. INDEXES FOR PROVENANCE LEDGER & AUDIT TRAIL
-- Accelerates hash-chain verification and chronological sequence loading
CREATE INDEX IF NOT EXISTS idx_provenance_org_event_num 
  ON provenance_events(organisation_id, event_number DESC);

CREATE INDEX IF NOT EXISTS idx_provenance_created_at 
  ON provenance_events(created_at DESC);

-- 6. INDEXES FOR NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read_created 
  ON notifications(recipient_profile_id, is_read, created_at DESC);

-- 7. OPTIMIZE RLS EVALUATION FUNCTIONS FOR SUB-MILLISECOND LOOKUPS
-- Ensure helper functions used in RLS policies are marked STABLE so PostgreSQL caches results within the transaction
CREATE OR REPLACE FUNCTION auth_user_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organisation_members om
    JOIN profiles p ON p.id = om.profile_id
    WHERE p.auth_user_id = auth.uid()
      AND om.organisation_id = org_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_supplier_owner(sup_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN suppliers s ON s.contact_email = p.email OR s.organisation_id IN (
      SELECT organisation_id FROM organisation_members WHERE profile_id = p.id
    )
    WHERE p.auth_user_id = auth.uid()
      AND s.id = sup_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 8. HIGH-PERFORMANCE RPC FUNCTIONS FOR DATABASE-LEVEL AGGREGATIONS
-- Allows single-roundtrip dashboard metric retrieval instead of fetching entire order tables
CREATE OR REPLACE FUNCTION get_buyer_dashboard_summary(p_org_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_spend NUMERIC(15, 2);
  v_pending_approvals INT;
  v_pending_payments INT;
  v_total_orders INT;
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN status IN ('payment_completed', 'delivered') THEN total_amount ELSE 0 END), 0),
    COUNT(CASE WHEN status = 'pending_approval' THEN 1 END),
    COUNT(CASE WHEN status IN ('approved', 'payment_pending') THEN 1 END),
    COUNT(*)
  INTO 
    v_total_spend,
    v_pending_approvals,
    v_pending_payments,
    v_total_orders
  FROM purchase_orders
  WHERE organisation_id = p_org_id;

  RETURN jsonb_build_object(
    'total_spend', v_total_spend,
    'pending_approvals', v_pending_approvals,
    'pending_payments', v_pending_payments,
    'total_orders', v_total_orders
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
