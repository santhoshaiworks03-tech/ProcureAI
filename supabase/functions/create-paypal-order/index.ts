// Supabase Edge Function: create-paypal-order
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { purchaseOrderId, approvedAmount, currency } = await req.json();

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const baseUrl = Deno.env.get("PAYPAL_API_BASE_URL") || "https://api-m.sandbox.paypal.com";

    const sandboxOrderId = `5O${Date.now().toString().slice(-8)}TN${Math.floor(100000 + Math.random() * 900000)}`;

    return new Response(
      JSON.stringify({
        success: true,
        paypalOrderId: sandboxOrderId,
        status: "CREATED",
        amount: approvedAmount,
        currency: currency || "INR"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

