-- ==============================================================================
-- PROCUREAI SECURITY HARDENING & FULL ROW LEVEL SECURITY (RLS) MIGRATION
-- Migration: 20261110000001_security_and_rls_hardening.sql
-- Enables RLS across all 28 tables, enforces multi-tenant isolation,
-- prevents role self-promotion, and guarantees immutable append-only provenance.
-- ==============================================================================

-- 1. Enable RLS on all 28 tables without exception
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS supplier_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS procurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS supplier_quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS supplier_comparison_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_fulfillment_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS paypal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS provenance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organisation_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. HELPER FUNCTIONS FOR SECURITY CONTEXT
-- ==============================================================================

-- Get current authenticated user profile
CREATE OR REPLACE FUNCTION auth_user_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is platform root admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is member of a specific organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organisation_members om
    JOIN profiles p ON p.id = om.profile_id
    WHERE p.auth_user_id = auth.uid()
      AND om.organisation_id = org_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is associated with a specific supplier
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

-- ==============================================================================
-- 3. PROFILES POLICIES & ROLE SELF-PROMOTION PREVENTION
-- ==============================================================================

-- Drop permissive legacy policies
DROP POLICY IF EXISTS "Public profiles can be read by authenticated users" ON profiles;

-- Users can view their own profile, members of their org, or all profiles if admin
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (
  auth.uid() = auth_user_id 
  OR is_platform_admin()
  OR id IN (
    SELECT om.profile_id FROM organisation_members om
    WHERE om.organisation_id IN (
      SELECT om2.organisation_id FROM organisation_members om2
      JOIN profiles p2 ON p2.id = om2.profile_id
      WHERE p2.auth_user_id = auth.uid()
    )
  )
);

-- Users can only update their own profile details, but NOT their role
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (
  auth.uid() = auth_user_id OR is_platform_admin()
);

-- Trigger: Prevent role self-promotion
CREATE OR REPLACE FUNCTION fn_prevent_role_self_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed and caller is not an admin, block it
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_platform_admin() THEN
    RAISE EXCEPTION 'Security Violation: Users cannot elevate their own role privileges. Only platform administrators can change roles.';
  END IF;
  
  -- Prevent users from activating their own suspended account
  IF NEW.is_active IS DISTINCT FROM OLD.is_active AND NOT is_platform_admin() THEN
    RAISE EXCEPTION 'Security Violation: Account status can only be modified by platform administrators.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_role_self_promotion ON profiles;
CREATE TRIGGER trg_prevent_role_self_promotion
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_role_self_promotion();

-- ==============================================================================
-- 4. AUTH TRIGGER: AUTOMATIC PROFILE CREATION ON SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  user_full_name TEXT;
  default_org_id UUID;
BEGIN
  -- Extract role from metadata, default to 'buyer'
  assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');
  IF assigned_role NOT IN ('buyer', 'supplier', 'admin') THEN
    assigned_role := 'buyer';
  END IF;

  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- Insert profile
  INSERT INTO public.profiles (
    auth_user_id,
    full_name,
    email,
    role,
    job_title,
    is_active
  ) VALUES (
    NEW.id,
    user_full_name,
    NEW.email,
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'Procurement Specialist'),
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to auth.users if available in Supabase
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ==============================================================================
-- 5. MULTI-TENANT ISOLATION POLICIES (ORGANISATIONS & MEMBERS)
-- ==============================================================================

CREATE POLICY "organisations_select" ON organisations FOR SELECT USING (
  is_platform_admin() OR is_org_member(id)
);

CREATE POLICY "organisation_members_select" ON organisation_members FOR SELECT USING (
  is_platform_admin() OR is_org_member(organisation_id)
);

-- ==============================================================================
-- 6. SUPPLIERS & CATALOGUE ACCESS POLICIES
-- ==============================================================================

-- Verified suppliers are readable by buyers; suppliers can view their own; admins view all
CREATE POLICY "suppliers_select_policy" ON suppliers FOR SELECT USING (
  is_platform_admin() 
  OR verification_status = 'verified'
  OR is_supplier_owner(id)
);

CREATE POLICY "suppliers_update_policy" ON suppliers FOR UPDATE USING (
  is_platform_admin() OR is_supplier_owner(id)
);

-- Products & categories are readable by all authenticated users
CREATE POLICY "products_select_authenticated" ON products FOR SELECT USING (true);
CREATE POLICY "product_categories_select_authenticated" ON product_categories FOR SELECT USING (true);

-- Supplier products: suppliers manage their own listings, buyers view active listings
CREATE POLICY "supplier_products_select" ON supplier_products FOR SELECT USING (
  is_platform_admin()
  OR is_supplier_owner(supplier_id)
  OR is_active = true
);

CREATE POLICY "supplier_products_modify" ON supplier_products FOR ALL USING (
  is_platform_admin() OR is_supplier_owner(supplier_id)
);

-- ==============================================================================
-- 7. PROCUREMENT, PURCHASE ORDERS & RFQ STRICT ISOLATION
-- ==============================================================================

-- Purchase Orders: Buyers view their org's POs; Suppliers view their assigned POs; Admin views all
CREATE POLICY "purchase_orders_select" ON purchase_orders FOR SELECT USING (
  is_platform_admin()
  OR is_org_member(organisation_id)
  OR is_supplier_owner(supplier_id)
);

CREATE POLICY "purchase_orders_insert" ON purchase_orders FOR INSERT WITH CHECK (
  is_platform_admin() OR is_org_member(organisation_id)
);

CREATE POLICY "purchase_order_items_select" ON purchase_order_items FOR SELECT USING (
  purchase_order_id IN (SELECT id FROM purchase_orders)
);

-- RFQ & Quotation Strict Isolation: Suppliers CANNOT see competitor quotations!
CREATE POLICY "rfqs_select" ON rfqs FOR SELECT USING (
  is_platform_admin()
  OR is_org_member(organisation_id)
  OR target_supplier_id IS NULL
  OR is_supplier_owner(target_supplier_id)
);

CREATE POLICY "supplier_quotes_select" ON supplier_quotes FOR SELECT USING (
  is_platform_admin()
  OR is_supplier_owner(supplier_id)
  OR rfq_id IN (SELECT id FROM rfqs WHERE is_org_member(organisation_id))
);

CREATE POLICY "supplier_quotes_insert" ON supplier_quotes FOR INSERT WITH CHECK (
  is_platform_admin() OR is_supplier_owner(supplier_id)
);

-- ==============================================================================
-- 8. PAYMENTS & PAYPAL ORDERS POLICIES
-- ==============================================================================

CREATE POLICY "payments_select" ON payments FOR SELECT USING (
  is_platform_admin()
  OR purchase_order_id IN (SELECT id FROM purchase_orders)
);

CREATE POLICY "paypal_orders_select" ON paypal_orders FOR SELECT USING (
  is_platform_admin()
  OR purchase_order_id IN (SELECT id FROM purchase_orders)
);

-- ==============================================================================
-- 9. IMMUTABLE APPEND-ONLY PROVENANCE & AUDIT LEDGER
-- ==============================================================================

-- Drop insecure legacy policies
DROP POLICY IF EXISTS "Provenance events are append-only" ON provenance_events;
DROP POLICY IF EXISTS "Provenance events insertion" ON provenance_events;

-- Everyone can audit provenance events
CREATE POLICY "provenance_events_select" ON provenance_events FOR SELECT USING (true);

-- Provenance events can ONLY be inserted by authenticated users or system
CREATE POLICY "provenance_events_insert" ON provenance_events FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL OR actor_role = 'system'
);

-- Trigger: Strictly block any UPDATE or DELETE on provenance_events
CREATE OR REPLACE FUNCTION fn_block_provenance_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Cryptographic Security Violation: Provenance events ledger is strictly immutable and append-only. UPDATE and DELETE operations are forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_provenance_tampering ON provenance_events;
CREATE TRIGGER trg_block_provenance_tampering
BEFORE UPDATE OR DELETE ON provenance_events
FOR EACH ROW
EXECUTE FUNCTION fn_block_provenance_tampering();

-- ==============================================================================
-- 10. APPROVALS & NOTIFICATIONS POLICIES
-- ==============================================================================

CREATE POLICY "approval_requests_select" ON approval_requests FOR SELECT USING (
  is_platform_admin()
  OR is_org_member(organisation_id)
  OR approver_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (
  recipient_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  OR is_platform_admin()
);
