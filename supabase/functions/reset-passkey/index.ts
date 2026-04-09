import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, reset_token, new_passkey } = await req.json();

    // Validate inputs
    if (!phone || !reset_token || !new_passkey) {
      return new Response(JSON.stringify({ error: "Phone, reset token, and new passkey are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return new Response(JSON.stringify({ error: "Invalid phone format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof new_passkey !== "string" || new_passkey.length < 6) {
      return new Response(JSON.stringify({ error: "Passkey must be at least 6 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Passkey strength: require at least one letter and one digit
    if (!/[a-zA-Z]/.test(new_passkey) || !/\d/.test(new_passkey)) {
      return new Response(JSON.stringify({ error: "Passkey must contain at least one letter and one digit" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the reset token: must be a recently used OTP for reset-passkey purpose
    // The token is the OTP id that was marked as used during verify-otp
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("id", reset_token)
      .eq("phone", phone)
      .eq("purpose", "reset-passkey")
      .not("used_at", "is", null)
      .single();

    if (otpError || !otpRecord) {
      return new Response(JSON.stringify({ error: "Invalid or expired reset token" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure the reset token was used within the last 10 minutes
    const usedAt = new Date(otpRecord.used_at!).getTime();
    if (Date.now() - usedAt > 10 * 60 * 1000) {
      return new Response(JSON.stringify({ error: "Reset token expired. Please request a new OTP." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up user by phone
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

    // Update the user's password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(profileData.user_id, {
      password: new_passkey,
    });

    if (error) {
      console.error("Reset passkey error:", error);
      return new Response(JSON.stringify({ error: "Failed to reset passkey. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Invalidate the reset token so it can't be reused
    await supabaseAdmin
      .from("otp_codes")
      .delete()
      .eq("id", reset_token);

    return new Response(JSON.stringify({ success: true, message: "Passkey reset successfully" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Reset passkey error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
