# ProcureAI API Documentation

## 1. Authentication & Security Headers
All requests must include an authenticated authorization header:
`Authorization: Bearer <supabase_or_session_jwt>`

---

## 2. AI Procurement Agent Endpoints

### `POST /api/ai/procure`
Accepts a natural-language purchasing requirement, runs requirement extraction, catalog matching, and multi-criteria supplier optimization.

**Request Body:**
```json
{
  "prompt": "I need 50 office chairs, 30 office desks and 20 filing cabinets. My budget is ₹5,00,000.",
  "organisationId": "uuid-buyer-org",
  "preferredProvider": "gemini"
}
```

**Response Body:**
```json
{
  "extractedRequirements": [
    { "itemName": "Ergonomic Office Chair", "quantity": 50, "estimatedBudget": 200000 },
    { "itemName": "Executive Standing Desk", "quantity": 30, "estimatedBudget": 200000 },
    { "itemName": "Modular Steel Filing Cabinet", "quantity": 20, "estimatedBudget": 100000 }
  ],
  "matchedProducts": [...],
  "supplierEvaluations": [...],
  "recommendedCombination": {
    "suppliers": [...],
    "totalCost": 472500,
    "budgetSavings": 27500,
    "tradeoffSummary": "Selected OmniOffice Direct and Ergotech Furnishings for fastest 3-day lead time while remaining 5.5% under budget."
  }
}
```

---

## 3. PayPal Orders API v2 Integration

### `POST /api/paypal/create-order`
Creates a PayPal order server-side with verified line items and currency conversion.
- Generates server-side idempotency keys.
- Enforces approved purchase order totals.

### `POST /api/paypal/capture-order`
Captures the PayPal order upon buyer approval.
- Validates authorized amount.
- Reconciles order status to `payment_completed`.
- Emits an append-only event to the Provenance Ledger.

---

## 4. Tokenized Checkout Sessions

### `POST /api/checkout/session`
Initializes a 5-minute time-limited checkout session.
- Computes SHA-256 session integrity signature.
- Automatically transitions to `expired` if not completed within 300 seconds.

