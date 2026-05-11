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
