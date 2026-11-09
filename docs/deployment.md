# ProcureAI: Production Deployment & Cloud Infrastructure Guide

## 1. Frontend Deployment (Vercel)

### Option A: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option B: Via Vercel Dashboard
1. Connect your GitHub repository to Vercel.
2. Select **Vite** as the framework preset.
3. Root Directory: `./`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_PAYPAL_CLIENT_ID`: Your PayPal Sandbox / Production Client ID
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (optional, defaults to local reactive engine)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key (optional)
   - `VITE_AI_PROVIDER`: `gemini` (or `openai` / `anthropic`)

---

## 2. Database & Backend Deployment (Supabase)

### Step 1: Create Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, open and execute `supabase/migrations/20261109000000_procureai_core_schema.sql`.
3. This creates all 28 tables, indexes, RLS policies, and SHA-256 hash trigger functions.

### Step 2: Deploy Supabase Edge Functions
```bash
npx supabase functions deploy ai-procurement
npx supabase functions deploy create-paypal-order
npx supabase functions deploy capture-paypal-order
npx supabase functions deploy paypal-webhook
npx supabase functions deploy verify-checkout-session
```

---

## 3. Node.js Companion Server Deployment (Optional API Gateway)
To run the server companion:
```bash
npm run server
```
Default port: `http://localhost:3001`

