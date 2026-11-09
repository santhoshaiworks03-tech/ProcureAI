# ProcureAI Database Entity & Relational Design

The database architecture is implemented in PostgreSQL / Supabase, consisting of 28 strongly typed relational entities with Row Level Security (RLS) and cryptographic hash chaining.

## Entity Relationship Overview
1. **`profiles`**: User identities, roles (`buyer`, `supplier`, `admin`), job titles, and auth mapping.
2. **`organisations`**: Companies, budget configurations, tax details, and verification flags.
3. **`organisation_members`**: Organization memberships with spending authorization limits.
4. **`suppliers`**: Supplier legal entities, GSTIN, reliability ratings, delivery performance, and PayPal merchant IDs.
5. **`supplier_verifications`**: Admin audit queue for supplier credential verification.
6. **`product_categories`**: Hierarchical category tree.
7. **`products`**: Master product catalog with SKU, GTIN/barcode, benchmark prices, and technical specs.
8. **`supplier_products`**: Supplier-specific listings with individual pricing, available stock, MOQ, and shipping lead times.
9. **`procurement_requests`**: Natural-language purchasing requests and parsed structured payloads.
10. **`procurement_request_items`**: Line items extracted from buyer requests.
11. **`supplier_quotes`**: Quotations submitted by suppliers or generated via catalog matching.
12. **`supplier_quote_items`**: Unit prices and line items for quotations.
13. **`supplier_scores`**: Transparent multi-criteria scoring breakdowns (Price 30%, Availability 20%, Delivery 20%, Reliability 20%, ESG 10%).
14. **`purchase_orders`**: Formal PO documents with status transitions from `draft` to `delivered`.
15. **`purchase_order_items`**: Line items in purchase orders.
16. **`approval_requests`**: Authorization requests linked to POs and approver tiers.
17. **`approval_history`**: Audit trail of manager decisions with timestamps and notes.
18. **`checkout_sessions`**: Tokenized, time-limited (5-minute countdown) payment authorization sessions.
19. **`paypal_orders`**: PayPal Orders API v2 tracking with intent and idempotency keys.
20. **`payments`**: Captured transaction receipts with PayPal capture IDs and fee breakdowns.
21. **`payment_webhook_events`**: Webhook event logs with signature validation status.
22. **`inventory_movements`**: Real-time stock audit tracking debits upon purchase order fulfillment.
23. **`demand_forecasts`**: AI-driven reorder points, consumption burn rates, and stockout estimates.
24. **`ai_agent_runs`**: Execution metrics (tokens, model provider, latency, intent).
25. **`ai_recommendations`**: Stored optimization tradeoffs and explanations.
26. **`provenance_events`**: Tamper-evident ledger with SHA-256 hash chaining.
27. **`notifications`**: Targeted user alerts.
28. **`organisation_settings`**: Configurable policies, approval limits, and preferred AI engines.
