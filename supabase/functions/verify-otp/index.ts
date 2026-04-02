import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, code, purpose } = await req.json();

    if (!phone || !code || !purpose) {
      return new Response(JSON.stringify({ error: "Phone, code, and purpose are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return new Response(JSON.stringify({ error: "Invalid phone format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ error: "OTP must be 6 digits" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find valid OTP
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .eq("purpose", purpose)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(JSON.stringify({ error: "Invalid or expired OTP. Please request a new one." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark OTP as used
    await supabaseAdmin
      .from("otp_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // For reset-passkey, we return a verification token
    if (purpose === "reset-passkey") {
      // Find the user by phone in profiles
      const { data: profileData } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("phone", phone)
        .single();

      if (!profileData) {
        return new Response(JSON.stringify({ error: "No account found with this phone number" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        verified: true,
        user_id: profileData.user_id,
        purpose: "reset-passkey",
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, verified: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
