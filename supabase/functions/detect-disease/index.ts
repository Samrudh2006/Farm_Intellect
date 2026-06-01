import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const cropType = formData.get("cropType") as string;

    if (!image || !cropType) {
      return new Response(JSON.stringify({ error: "Missing image or crop type" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('AI_API_KEY') || Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI API Key not configured in Supabase Secrets" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = image.type;

    // Use Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an expert agricultural AI. I am uploading a picture of a ${cropType} crop.
    Identify any diseases, pests, or deficiencies. 
    Respond ONLY with a raw JSON object matching exactly this structure (no markdown tags, no code blocks):
    {
      "disease": "Name of disease",
      "confidence": 95,
      "severity": "low/medium/high/critical",
      "category": "fungal/bacterial/viral/pest/deficiency",
      "description": "Brief description",
      "symptomsDetected": ["symptom 1", "symptom 2"],
      "treatment": {
        "chemical": ["Medicine Name @ Dosage"],
        "organic": ["Organic method 1"],
        "cultural": ["Cultural method 1"]
      },
      "prevention": ["Prevention tip 1"],
      "yieldLossEstimate": "5-15%",
      "urgency": "immediate/within_week/monitor",
      "alternativeDiagnoses": [
        {"disease": "Alternative 1", "confidence": 30}
      ]
    }`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    let aiText = data.candidates[0].content.parts[0].text;
    // Clean up potential markdown formatting from Gemini
    aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedDetection = JSON.parse(aiText);

    return new Response(JSON.stringify({ detection: parsedDetection }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error("AI Scan Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
