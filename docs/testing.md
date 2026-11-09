# ProcureAI: Quality Assurance & End-to-End Verification Guide

This document specifies the validation procedure for testing the end-to-end procurement and payment lifecycle in **ProcureAI**.

---

## 1. End-to-End Required Demonstration Walkthrough
As specified in Section 21 of the specification:

### Scenario:
A business user submits the following natural-language request:
> *"I need 50 office chairs, 30 office desks and 20 filing cabinets. My budget is ₹5,00,000. Find reliable suppliers, compare prices, estimate delivery and prepare the best purchase order."*

### Step-by-Step Test Procedure:
1. **Navigate to AI Procurement Agent**:
   - Click on **AI Procurement Agent** in the sidebar (or navigate to `/agent`).
2. **Submit Purchasing Requirement**:
   - The default demonstration prompt is preloaded in the input box, or select it from the suggested prompt pills.
   - Click **Analyze & Optimize**.
3. **Verify Requirement Extraction**:
   - Verify that the agent parses:
     - 50x Ergonomic Mesh Chairs (`FUR-CHR-AERO-01`)
     - 30x Standing Desks (`FUR-DSK-DUAL-01`)
     - 20x 3-Drawer Steel Cabinets (`FUR-CAB-PED3-01`)
     - Budget: `₹5,00,000`
4. **Inspect Supplier Intelligence & Scoring**:
   - Verify that the multi-criteria scoring table displays ranks across verified suppliers.
   - Notice the transparent calculation breakdown: Price (30%), Availability (20%), Delivery (20%), Reliability (20%), Quality (10%).
5. **Inspect Procurement Optimization & Savings**:
   - Check the cost optimization card showing total projected spend and AI budget savings.
6. **Verify Purchase Order Draft**:
   - Confirm a unique PO number (e.g. `PO-2024-0893`) is generated with status `PENDING_APPROVAL`.
7. **Test Human-in-the-Loop Approval Gating**:
   - Attempting to bypass approval is strictly blocked.
   - Click **Go to Approval Queue** (or navigate to `/approvals`).
   - Click **Approve Order**. The PO status updates to `APPROVED`.
8. **Test Tokenized Checkout & Expiry Timer**:
   - Click **Proceed to PayPal Checkout** (or navigate to `/payments`).
   - Verify the 5-minute live visual countdown timer (`05:00` counting down).
   - Verify the SHA-256 integrity hash badge.
9. **Execute PayPal Sandbox Payment**:
   - Click the PayPal Sandbox button.
   - A verified PayPal Sandbox capture event is processed.
   - Celebratory confetti triggers, and the official PayPal Capture ID is rendered on screen.
10. **Verify Provenance Ledger & Audit Trail**:
    - Click **Inspect Provenance Ledger** (or navigate to `/provenance`).
    - Verify that new blocks have been appended to the ledger:
      - `PURCHASE_ORDER_GENERATED`
      - `HUMAN_APPROVAL_GRANTED`
      - `TOKENIZED_CHECKOUT_SESSION_CREATED`
      - `PAYPAL_ORDER_CREATED`
      - `PAYPAL_PAYMENT_CAPTURED`
    - Verify SHA-256 hash chaining and reference codes (`PRC-VRF-XXXXXXXXXXXX`).
11. **Verify Financial Analytics**:
    - Navigate to `/analytics`. Verify the settled transaction is reflected in total spend and monthly charts.
12. **Download Purchase Order PDF**:
    - Navigate to `/orders`. Click the download button to generate an official B2B PDF invoice.

