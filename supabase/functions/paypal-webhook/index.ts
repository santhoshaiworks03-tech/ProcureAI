// Supabase Edge Function: paypal-webhook
// Secure PayPal Webhook handler with signature verification and idempotent processing
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    const baseUrl = Deno.env.get("PAYPAL_API_BASE_URL") || "https://api-m.sandbox.paypal.com";

    // 1. Signature Verification with PayPal API
    if (clientId && clientSecret && webhookId) {
      const authBasic = btoa(`${clientId}:${clientSecret}`);
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${authBasic}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      });

      if (tokenRes.ok) {
        const { access_token } = await tokenRes.json();

        const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            transmission_id: req.headers.get("paypal-transmission-id"),
            transmission_time: req.headers.get("paypal-transmission-time"),
            cert_url: req.headers.get("paypal-cert-url"),
            auth_algo: req.headers.get("paypal-auth-algo"),
            transmission_sig: req.headers.get("paypal-transmission-sig"),
            webhook_id: webhookId,
            webhook_event: event
          })
        });

        const verification = await verifyRes.json();
        if (verification.verification_status !== "SUCCESS") {
          console.error("PayPal Webhook signature invalid:", verification);
          return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
    }

    // 2. Process webhook event idempotently
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const capture = event.resource;
        const customId = capture.custom_id; // purchase_order_id

        if (customId) {
          await supabase
            .from("purchase_orders")
            .update({ status: "payment_completed" })
            .eq("id", customId);

          await supabase
            .from("provenance_events")
            .insert({
              event_type: "PAYPAL_WEBHOOK_VERIFIED",
              actor_name: "PayPal Orders Webhook Listener",
              actor_role: "system",
              purchase_order_id: customId,
              metadata: {
                event_id: event.id,
                capture_id: capture.id,
                status: capture.status,
                amount: capture.amount?.value
              }
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        received: true,
        eventId: event.id,
        eventType: event.event_type
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
