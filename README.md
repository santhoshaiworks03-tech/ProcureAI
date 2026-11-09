# ProcureAI — Autonomous AI Procurement & Payment Agent

> **Intelligent Procurement. Trusted Suppliers. Seamless Payments powered by PayPal.**

ProcureAI is an enterprise-grade autonomous B2B procurement and FinTech SaaS platform. It streamlines the business purchasing lifecycle using multi-provider AI agents, transparent supplier intelligence, demand forecasting, automated purchase order generation, human-in-the-loop authorization gating, and tokenized PayPal Orders API v2 settlement.

---

## 🌟 Key Features

1. **Autonomous AI Procurement Agent (Natural Language Input)**:
   - Understands unstructured procurement requests (e.g., *"I need 50 office chairs, 30 office desks and 20 filing cabinets. My budget is ₹5,00,000."*).
   - Extracts products, quantities, specifications, and budget into validated structured JSON.
   - Matches requirements strictly against real catalogue records (SKU / GTIN).
2. **Transparent Supplier Scoring Engine**:
   - Multi-criteria weighted evaluation: Price (30%), Availability (20%), Delivery (20%), Reliability (20%), Quality/ESG (10%).
   - Interactive sliders on the Supplier Intelligence dashboard to customize scoring weights in real-time.
3. **Automated Purchase Order Generation & PDF Export**:
   - Compiles formal B2B Purchase Orders with GST tax calculations, shipping, terms, and auto-generated professional PDF invoices using `jsPDF`.
4. **Strict Human-in-the-Loop Governance**:
   - The AI Agent generates draft purchase orders but is **strictly blocked** from financial execution without an authorized human manager signature.
5. **Tokenized Checkout Sessions (5-Minute Countdown Expiry)**:
   - Approved orders enter a secure, time-limited checkout session with live `05:00` countdown timer and cryptographic SHA-256 integrity hashing.
6. **PayPal Developer Platform Integration (Orders API v2)**:
   - Full server-side order creation and capture reconciliation.
   - Built with official PayPal JavaScript SDK and verified Sandbox capture flow.
7. **Cryptographic Provenance Ledger**:
   - Append-only audit trail linking every procurement lifecycle event using continuous SHA-256 hash chaining.
   - Generates unique verification reference codes (`PRC-VRF-XXXXXXXXXXXX`) for tamper-evident compliance.
8. **Predictive Demand Forecasting**:
   - Consumption burn rate analysis, stockout countdown projections, and autonomous reorder suggestions.
9. **Role-Based Workspaces**:
   - One-click role switcher between **Business Buyer**, **Supplier**, and **Platform Administrator**.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v26)
- **Package Manager**: npm or pnpm

### 2. Installation
```bash
git clone <repository-url>
cd "paypal hackathon"
npm install
```

### 3. Environment Variables
Review `.env.example` and create `.env`:
```bash
cp .env.example .env
```
Default parameters run cleanly out of the box with zero external configuration required.

### 4. Running the Application
```bash
# Start frontend development server
npm run dev

# (Optional) Start companion backend server
npm run server
```
Open **`http://localhost:5173`** in your browser.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router DOM, TanStack Query |
| **Data Visuals** | Recharts (Spending Trends & Forecasts), jsPDF & html2canvas (Purchase Order Invoices) |
| **Payments** | PayPal Developer Platform, PayPal Orders API v2, `@paypal/react-paypal-js`, Sandbox Gateway |
| **Database & Backend** | PostgreSQL (28 Relational Tables), Supabase Auth, Row Level Security (RLS), Supabase Edge Functions |
| **AI Architecture** | Multi-Provider Engine (Google Gemini 1.5 Pro, OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet) |

---

## 🔒 Security & Governance

- **Zero Client-Side Price Trust**: Payable amounts are locked server-side against approved purchase orders.
- **Payment Idempotency**: Unique keys prevent accidental duplicate captures.
- **Tamper-Evident Auditability**: Every state change writes to an append-only cryptographic ledger.
- **No Secret Exposure**: PayPal Client Secrets and LLM API keys are isolated server-side.

---

## 📄 License
MIT License. Built for the **PayPal AI Hackathon 2026**.
