import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, mode, imageBase64, imageMimeType } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("No AI API key configured");
    }

    const systemPrompts: Record<string, string> = {
      chat: `You are an expert Indian agricultural AI assistant called "Farm Intellect". You provide real, actionable farming advice based on Indian agricultural practices, ICAR recommendations, and current best practices.

Key expertise areas:
- Crop management (Kharif, Rabi, Zaid seasons)
- Pest & disease identification and treatment (IPM practices)
- Soil health management and fertilizer recommendations
- Weather-based advisories for Indian states
- Government schemes (PM-KISAN, PMFBY, Soil Health Card, eNAM)
- Market prices and mandi information
- Irrigation techniques and organic farming

Always provide specific, practical advice with dosages, timings, and varieties. Reference Indian conditions and local practices. Use markdown formatting.`,

      disease: `You are an expert plant pathologist specializing in Indian crops. Analyze crop images and symptoms to provide:
1. Disease/pest identification with confidence level
2. Severity assessment (low/medium/high)
3. Immediate treatment with specific products and dosages
4. Preventive measures
5. When to consult a local agricultural officer

Be specific about Indian crop varieties and locally available treatments. Always recommend IPM approaches first.`,

      vision: `You are Dr. Krishi, an expert agricultural plant pathologist with 30+ years of experience in Indian agriculture. You are examining a crop photo shared by a farmer during a video consultation.

Analyze the image carefully and provide:
1. **Disease/Pest Identification**: Name the disease or pest with confidence percentage
2. **Affected Crop**: Identify the crop if visible
3. **Severity**: Rate as Mild / Moderate / Severe / Critical
4. **Symptoms Observed**: List visible symptoms in the image
5. **Diagnosis**: Detailed explanation of the condition
6. **Immediate Treatment**:
   - Chemical treatment with exact product names, dosages (ml/L or g/L), and spray schedule
   - Organic/bio alternatives
7. **Preventive Measures**: Steps to prevent recurrence
8. **Prognosis**: Expected recovery timeline if treated
9. **Emergency**: Whether immediate action is needed

Use Indian product names and brands (Tata Rallis, UPL, Bayer, Syngenta, etc.). Reference ICAR/SAU recommendations. Be empathetic and clear — the farmer may be worried about their livelihood.`,

      recommendation: `You are an AI crop recommendation engine for Indian farmers. Based on soil parameters, location, and season, recommend the best crops with varieties, expected yield, profit range, planting window, and risk factors.`,

      yield: `You are an agricultural yield prediction AI. Provide predicted yield, confidence level, risk assessment, and actionable recommendations. Reference ICAR benchmarks.`
    };

    const activeMode = imageBase64 ? "vision" : (mode || "chat");
    const systemPrompt = systemPrompts[activeMode] || systemPrompts.chat;

    // If we have an image AND Gemini key, use Gemini Vision API
    if (imageBase64 && GEMINI_API_KEY) {
      const lastUserMessage = messages[messages.length - 1]?.content || "Please analyze this crop image for diseases.";
      
      const geminiContents = [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
          ]
        },
        {
          role: "model",
          parts: [{ text: "I am Dr. Krishi, ready to examine your crop images and provide expert diagnosis." }]
        },
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: imageMimeType || "image/jpeg",
                data: imageBase64,
              }
            },
            { text: lastUserMessage }
          ]
        }
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini Vision error:", response.status, errText);
        return new Response(JSON.stringify({ error: "Vision analysis failed. Please try again." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          for (const line of text.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
              }
            } catch (parseError) {
              console.warn("Failed to parse streamed JSON chunk", parseError);
            }
          }
        },
        flush(controller) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        },
      });

      return new Response(response.body!.pipeThrough(transformStream), {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // If image but no Gemini key, use Lovable AI with vision model
    if (imageBase64 && LOVABLE_API_KEY) {
      const lastUserMessage = messages[messages.length - 1]?.content || "Please analyze this crop image.";
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}` } },
                { type: "text", text: lastUserMessage },
              ],
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "Vision analysis failed." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Standard text chat
    let response: Response;

    if (GEMINI_API_KEY) {
      const geminiMessages = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am Farm Intellect, ready to help." }] },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      ];

      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini error:", response.status, errText);
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "AI service unavailable." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          for (const line of text.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
              }
            } catch (parseError) {
              console.warn("Failed to parse streamed JSON chunk", parseError);
            }
          }
        },
        flush(controller) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        },
      });

      return new Response(response.body!.pipeThrough(transformStream), {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "AI service unavailable." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
