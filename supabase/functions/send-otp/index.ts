import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, purpose } = await req.json();

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return new Response(JSON.stringify({ error: "Valid Indian phone number required (+91XXXXXXXXXX)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validPurposes = ["login", "signup", "reset-passkey"];
    if (!purpose || !validPurposes.includes(purpose)) {
      return new Response(JSON.stringify({ error: "Invalid purpose" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 5 OTPs per phone per 15-minute window
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabaseAdmin
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gt("created_at", fifteenMinAgo);

    if ((recentCount ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: "Too many OTP requests. Please wait 15 minutes before trying again." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate 6-digit OTP using crypto-secure random
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const code = String(100000 + (randomBytes[0] % 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Invalidate previous unused OTPs for this phone+purpose
    await supabaseAdmin
      .from("otp_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("phone", phone)
      .eq("purpose", purpose)
      .is("used_at", null);

    // Insert new OTP
    const { error: insertError } = await supabaseAdmin
      .from("otp_codes")
      .insert({ phone, code, purpose, expires_at: expiresAt });

    if (insertError) {
      console.error("OTP insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to generate OTP" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send SMS via Twilio
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromPhone) {
      console.error("Twilio credentials not configured");
      return new Response(JSON.stringify({ error: "SMS service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const purposeMessages: Record<string, string> = {
      "login": `Your Smart Crop Advisory login code is: ${code}. Valid for 10 minutes. Do not share this code.`,
      "signup": `Welcome to Smart Crop Advisory! Your verification code is: ${code}. Valid for 10 minutes.`,
      "reset-passkey": `Your passkey reset code is: ${code}. Valid for 10 minutes. If you didn't request this, ignore this message.`,
    };

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: phone,
        From: fromPhone,
        Body: purposeMessages[purpose] || `Your verification code is: ${code}`,
      }),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", JSON.stringify(twilioData));
      return new Response(JSON.stringify({ error: "Failed to send SMS. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Don't log the phone number in production — log only the SID
    console.log(`OTP sent for ${purpose}, SID: ${twilioData.sid}`);

    return new Response(JSON.stringify({ success: true, message: "OTP sent successfully" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
