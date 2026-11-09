// Supabase Edge Function: verify-checkout-session
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
    const { sessionToken, expiresAt, approvedAmount, currency } = await req.json();

    const expiryTime = new Date(expiresAt).getTime();
    const remainingSeconds = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));

    if (remainingSeconds <= 0) {
      return new Response(
        JSON.stringify({ valid: false, reason: "Session has expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        remainingSeconds,
        approvedAmount,
        currency
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
