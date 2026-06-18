import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

async function evaluateAI(prompt: string, expectedSchemaKey: string) {
  if (!GEMINI_API_KEY) {
    console.warn("Skipping AI eval: No GEMINI_API_KEY");
    return true; // Skip gracefully in CI if no key
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: "application/json" }
    }),
  });

  if (!res.ok) throw new Error("Gemini API Error");
  const data = await res.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(resultText);
  
  return parsed.hasOwnProperty(expectedSchemaKey);
}

Deno.test("AI Evaluates: Scheme Scraping JSON Schema Adherence", async () => {
  const prompt = `Return a JSON object describing a fake scheme. It must have a "name" property.`;
  const isValid = await evaluateAI(prompt, "name");
  assertEquals(isValid, true);
});

Deno.test("AI Evaluates: FAQ Generator JSON Schema Adherence", async () => {
  const prompt = `Return a JSON array of objects. Since I need to parse the first object, wrap the array in an object like { "faqs": [...] }.`;
  const isValid = await evaluateAI(prompt, "faqs");
  assertEquals(isValid, true);
});
