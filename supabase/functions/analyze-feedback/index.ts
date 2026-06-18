import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    const { record } = payload;
    
    if (!record || !record.content) {
      return new Response("Missing record", { status: 400 });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    const systemPrompt = `You are an AI support agent analyzing farmer feedback.
Categorize the feedback into exactly one of these categories: "bug", "feature", "complaint", "general".
Output MUST be a valid JSON object with the property "category" and "suggested_action".
Feedback: "${record.content}"`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: "Analyze the feedback." }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    if (!aiRes.ok) throw new Error("Gemini API Error");

    const aiData = await aiRes.json();
    const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const analysis = JSON.parse(resultText);

    let githubIssueUrl = null;

    // If it's a bug or feature, create a GitHub Issue automatically
    if (analysis.category === "bug" || analysis.category === "feature") {
      const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
      const GITHUB_REPO = Deno.env.get("GITHUB_REPO"); // e.g. "user/repo"
      
      if (GITHUB_TOKEN && GITHUB_REPO) {
        const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json"
          },
          body: JSON.stringify({
            title: `[Feedback ${analysis.category.toUpperCase()}]: ${record.content.substring(0, 50)}...`,
            body: `**Original Feedback:**\n${record.content}\n\n**Suggested Action:**\n${analysis.suggested_action}`,
            labels: [analysis.category]
          })
        });
        
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          githubIssueUrl = ghData.html_url;
        }
      }
    }

    // Update the record with the category and issue URL
    await supabase.from("farmer_feedback").update({
      category: analysis.category,
      github_issue_url: githubIssueUrl
    }).eq("id", record.id);

    return new Response(JSON.stringify({ success: true, category: analysis.category, issueUrl: githubIssueUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error analyzing feedback:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
