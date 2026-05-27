export type AiMessage = { role: "user" | "assistant" | "system"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export async function streamChat({
  messages,
  mode = "chat",
  imageBase64,
  imageMimeType,
  onDelta,
  onDone,
  onError,
}: {
  messages: AiMessage[];
  mode?: "chat" | "disease" | "recommendation" | "yield" | "vision";
  imageBase64?: string;
  imageMimeType?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}) {
  const isMock = !import.meta.env.VITE_SUPABASE_URL || 
                 import.meta.env.VITE_SUPABASE_URL.includes("<project-ref>") ||
                 import.meta.env.VITE_SUPABASE_URL.includes("mockproject");

  if (isMock) {
    let responseText = "Welcome to Krishi AI local helper! I can assist with crop advisory, disease scanning, and weather guidance.";
    if (mode === "disease") {
      responseText = "Based on the leaf scan, we detected **Cercospora Leaf Spot**.\n\n**Remedy:**\n1. Remove infected leaves.\n2. Spray Neem oil or copper fungicide.\n3. Avoid overhead watering to reduce moisture on leaves.";
    } else if (mode === "recommendation") {
      responseText = "I recommend **Wheat** or **Mustard** for your soil composition and the current winter season.\n\n* Soil pH: 6.5\n* Expected Water: Moderate\n* Growth duration: 120-140 days";
    } else if (mode === "yield") {
      responseText = "Predicted Yield: **4.5 Tons/Hectare** under normal weather conditions. This estimate is based on typical regional soil reports and historical yields.";
    } else {
      const userMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
      if (userMsg.includes("wheat") || userMsg.includes("गेहूं")) {
        responseText = "Wheat is a Rabi crop sown in winter. It requires well-drained loam soils and cool weather during the growing season. Maintain regular irrigation at critical stages.";
      } else if (userMsg.includes("rice") || userMsg.includes("धान")) {
        responseText = "Rice is a Kharif crop that requires clayey loam soil and standing water. Sow in June-July and harvest in November. Ensure consistent water levels.";
      } else if (userMsg.includes("scheme") || userMsg.includes("योजना")) {
        responseText = "You qualify for **PM-KISAN** (₹6,000/year direct transfer) and **PM Fasal Bima Yojana** (Crop insurance safety net). Contact local block office for enrollment.";
      }
    }

    const words = responseText.split(" ");
    let index = 0;
    const interval = setInterval(() => {
      if (index < words.length) {
        onDelta(words[index] + " ");
        index++;
      } else {
        clearInterval(interval);
        onDone();
      }
    }, 40);
    return;
  }

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const body: Record<string, unknown> = { messages, mode };
    if (imageBase64) {
      body.imageBase64 = imageBase64;
      body.imageMimeType = imageMimeType || "image/jpeg";
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      let errMsg = `Request failed (${resp.status})`;
      try {
        const payload = await resp.json();
        errMsg = payload.error || errMsg;
      } catch (parseError) {
        console.warn("Failed to parse stream line", parseError);
      }

      if (resp.status === 429) errMsg = "Too many requests — please wait a moment.";
      if (resp.status === 402) errMsg = "AI credits exhausted. Please add credits.";

      onError?.(errMsg);
      onDone();
      return;
    }

    if (!resp.body) {
      onError?.("No response body");
      onDone();
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch (parseError) {
        console.warn("Failed to parse stream line", parseError);
      }
      }
    }

    onDone();
  } catch (e) {
    onError?.(e instanceof Error ? e.message : "Connection failed");
    onDone();
  }
}

/** Non-streaming call */
export async function invokeAI({
  messages,
  mode = "chat",
}: {
  messages: AiMessage[];
  mode?: "chat" | "disease" | "recommendation" | "yield";
}): Promise<string> {
  let result = "";
  await streamChat({
    messages,
    mode,
    onDelta: (t) => { result += t; },
    onDone: () => {},
    onError: (err) => { throw new Error(err); },
  });
  return result;
}
