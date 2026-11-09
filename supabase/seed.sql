-- ==============================================================================
-- PROCUREAI SEED DATA SCRIPT
-- Populates all master organisations, categories, products, suppliers, listings
-- ==============================================================================

-- 1. ORGANISATIONS
INSERT INTO organisations (id, name, slug, business_registration_no, tax_id, industry, currency, annual_procurement_budget, is_verified)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Apex Tech Solutions Pvt Ltd', 'apex-tech', 'U72900KA2021PTC145678', '29ABCDE1234F1Z5', 'Enterprise Software & Cloud AI', 'INR', 15000000, true),
  ('a0000000-0000-0000-0000-000000000002', 'Quantum Dynamics Ltd', 'quantum-dynamics', 'U29100MH2019PLC098765', '27AABCQ9876K1Z2', 'FinTech & Digital Payments', 'INR', 8500000, true),
  ('a0000000-0000-0000-0000-000000000003', 'Sterling Retail Corporation', 'sterling-retail', 'U52100DL2018PTC334455', '07AAACS5544L1Z9', 'Retail & Commercial Chains', 'INR', 20000000, true)
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO product_categories (id, name, slug, description, icon)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Ergonomic Seating', 'ergonomic-seating', 'Task chairs, executive mesh chairs, and conference seating', 'Armchair'),
  ('c0000000-0000-0000-0000-000000000002', 'Workstations & Desks', 'workstations-desks', 'Height-adjustable standing desks, modular benching', 'Layout'),
  ('c0000000-0000-0000-0000-000000000003', 'Storage & Filing', 'storage-filing', 'Lockable steel pedestals, vertical filing cabinets', 'Archive'),
  ('c0000000-0000-0000-0000-000000000004', 'Monitors & Displays', 'monitors-displays', 'Professional 4K color-accurate screens and dual-arm displays', 'Monitor'),
  ('c0000000-0000-0000-0000-000000000005', 'Enterprise Computing', 'enterprise-computing', 'Business laptops, mini workstation PCs', 'Laptop')
ON CONFLICT (id) DO NOTHING;

-- 3. PRODUCTS (Catalogue)
INSERT INTO products (id, category_id, name, sku, gtin, brand, description, unit_of_measurement, benchmark_market_price, is_active)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'AeroPro Ergonomic High-Back Mesh Chair', 'FUR-CHR-AERO-01', '8901234567891', 'AeroForm', 'BIFMA-certified ergonomic chair with 4D adjustable armrests and synchronized tilt.', 'unit', 3800, true),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'SpineAlign Executive Lumbar Task Chair', 'FUR-CHR-SPINE-02', '8901234567892', 'ErgoLife', 'Dynamic spinal support chair engineered for 12+ hour daily coding and engineering work.', 'unit', 3600, true),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Dual-Motor Electric Standing Desk (140x70cm)', 'FUR-DSK-DUAL-01', '8901234567901', 'ApexRise', 'Heavy-duty dual motor sit-stand workstation with digital LED preset controller.', 'unit', 6800, true),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Heavy-Duty 3-Drawer Steel Mobile Pedestal', 'FUR-CAB-PED3-01', '8901234567911', 'IronVault', 'Precision cold-rolled steel under-desk pedestal with central interlock system.', 'unit', 3400, true),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 'UltraSharp 27-inch 4K USB-C Hub Monitor', 'IT-MON-274K-01', '8901234567921', 'OptiView', 'IPS Black panel 4K display with 90W USB-C power delivery and LAN RJ45 port.', 'unit', 32000, true),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 'EliteBook 14-inch G10 Business Laptop', 'IT-LAP-ELITE-01', '8901234567931', 'HewlettPro', 'Intel Core i7 vPro 13th Gen, 32GB DDR5 RAM, 1TB NVMe Gen4 SSD notebook.', 'unit', 98000, true)
ON CONFLICT (id) DO NOTHING;

-- 4. SUPPLIERS
INSERT INTO suppliers (id, company_name, legal_name, gtin_tax_id, contact_email, contact_phone, business_category, verification_status, reliability_score, delivery_rating, quality_score, payment_terms, paypal_merchant_id, is_provisional)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'OmniOffice Direct Ltd', 'OmniOffice Infrastructure & Supplies Pvt Ltd', '29AAACH1122M1ZX', 'sales@omniofficedirect.com', '+91 80 4455 6677', 'Office Furniture & Workstations', 'verified', 96.5, 4.8, 95.0, 'PayPal Express / Net 30', 'PPL-MERCH-OMNI01', false),
  ('e0000000-0000-0000-0000-000000000002', 'Ergotech Furnishings Corp', 'Ergotech India Seating Systems LLP', '27AABFE3344P1Z3', 'procurement@ergotechindia.com', '+91 22 2890 1234', 'Ergonomic Chairs & Desks', 'verified', 94.0, 4.7, 96.5, 'PayPal Instant Capture / Net 15', 'PPL-MERCH-ERGO02', false),
  ('e0000000-0000-0000-0000-000000000003', 'Horizon Office Ware', 'Horizon Modular Works Ltd', '07AAACH9988R1Z1', 'orders@horizonoffice.com', '+91 11 2680 5544', 'Storage Cabinets & Partitions', 'verified', 91.0, 4.5, 90.0, 'PayPal Express / Net 30', 'PPL-MERCH-HORIZON03', false),
  ('e0000000-0000-0000-0000-000000000004', 'CloudNine Tech Supplies', 'CloudNine Enterprise Computing Hub', '29AABCC8899J1Z7', 'enterprise@cloudninetech.com', '+91 80 6712 9000', 'Enterprise Hardware & Accessories', 'verified', 95.0, 4.8, 97.0, 'PayPal Instant Capture', 'PPL-MERCH-CLOUD07', false)
ON CONFLICT (id) DO NOTHING;

-- 5. SUPPLIER_PRODUCTS (Listings with price & stock)
INSERT INTO supplier_products (id, supplier_id, product_id, supplier_sku, unit_price, available_stock, min_order_quantity, estimated_delivery_days, shipping_cost_per_unit, listing_status)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'OMNI-CHR-AERO', 3650, 140, 5, 3, 80, 'active'),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'ERGO-CHR-AERO1', 3520, 85, 10, 4, 75, 'active'),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'OMNI-DSK-DUAL', 6490, 75, 2, 3, 150, 'active'),
  ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'HOR-PED-01', 3250, 120, 5, 3, 95, 'active'),
  ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006', 'CN-LAP-EB14', 94500, 35, 1, 2, 250, 'active')
ON CONFLICT (id) DO NOTHING;
