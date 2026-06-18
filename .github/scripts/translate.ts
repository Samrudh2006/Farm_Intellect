import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("No GEMINI_API_KEY provided");
  process.exit(1);
}

const LANGUAGES = [
  "hi", "bn", "te", "mr", "ta", "ur", "gu", "kn", "or", "ml",
  "pa", "as", "mai", "sat", "ks", "ne", "sd", "kok", "doi", "mni", "bo", "sa"
];

const EN_JSON_PATH = path.join(process.cwd(), "public", "locales", "en.json");
if (!fs.existsSync(EN_JSON_PATH)) {
  console.error("en.json not found!");
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(EN_JSON_PATH, "utf-8"));

async function translateChunk(textChunk: string, targetLang: string) {
  const systemPrompt = `You are a professional translator. Translate the given English text to ${targetLang} (ISO code). Return ONLY the translated text.`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: textChunk }] }],
    }),
  });

  if (!res.ok) throw new Error("Gemini API error");
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || textChunk;
}

async function main() {
  for (const lang of LANGUAGES) {
    console.log(`Processing translation for ${lang}...`);
    const langPath = path.join(process.cwd(), "public", "locales", `${lang}.json`);
    let langData: any = {};
    if (fs.existsSync(langPath)) {
      langData = JSON.parse(fs.readFileSync(langPath, "utf-8"));
    }

    let modified = false;
    for (const key of Object.keys(enData)) {
      if (!langData[key]) {
        console.log(`Translating key: ${key}`);
        try {
          langData[key] = await translateChunk(enData[key], lang);
          modified = true;
          // Rate limit protection
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
          console.error(`Failed translating ${key} to ${lang}`);
        }
      }
    }

    if (modified) {
      fs.writeFileSync(langPath, JSON.stringify(langData, null, 2));
      console.log(`Saved ${lang}.json`);
    }
  }
}

main().catch(console.error);
