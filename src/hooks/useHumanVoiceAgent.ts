import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Status = "idle" | "listening" | "thinking" | "speaking";
type Msg = { role: "user" | "assistant"; content: string };

interface Options {
  language?: string;
  voice?: string;
  region?: string;
  onError?: (msg: string) => void;
}

// Encode Float32 PCM chunks (any sample rate) as a mono 16-bit WAV blob at 16kHz.
function encodeWav(chunks: Float32Array[], sourceRate: number): Blob {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let o = 0;
  for (const c of chunks) { merged.set(c, o); o += c.length; }

  // Downsample to 16kHz
  const targetRate = 16000;
  const ratio = sourceRate / targetRate;
  const outLen = Math.floor(merged.length / ratio);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const s = merged[Math.floor(i * ratio)] || 0;
    out[i] = Math.max(-1, Math.min(1, s)) * 0x7fff;
  }

  const buf = new ArrayBuffer(44 + out.length * 2);
  const view = new DataView(buf);
  const w = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  w(0, "RIFF");
  view.setUint32(4, 36 + out.length * 2, true);
  w(8, "WAVE"); w(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  w(36, "data");
  view.setUint32(40, out.length * 2, true);
  new Int16Array(buf, 44).set(out);
  return new Blob([buf], { type: "audio/wav" });
}

export function useHumanVoiceAgent(opts: Options = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const playCtxRef = useRef<AudioContext | null>(null);
  const playheadRef = useRef(0);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const silenceMsRef = useRef(0);
  const spokeRef = useRef(false);
  const monitorRef = useRef<number | null>(null);

  const cleanupCapture = useCallback(() => {
    nodeRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    nodeRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    if (monitorRef.current) { window.clearInterval(monitorRef.current); monitorRef.current = null; }
  }, []);

  const stopSpeaking = useCallback(() => {
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
    activeSourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    activeSourcesRef.current = [];
    playheadRef.current = 0;
  }, []);

  const stopAll = useCallback(() => {
    cleanupCapture();
    stopSpeaking();
    setStatus("idle");
  }, [cleanupCapture, stopSpeaking]);

  useEffect(() => () => stopAll(), [stopAll]);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;
    stopSpeaking();
    setStatus("speaking");
    const ctx = playCtxRef.current || new AudioContext({ sampleRate: 24000 });
    playCtxRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    playheadRef.current = 0;
    let pending = new Uint8Array(0);

    const scheduleChunk = (incoming: Uint8Array) => {
      const bytes = new Uint8Array(pending.length + incoming.length);
      bytes.set(pending); bytes.set(incoming, pending.length);
      const usable = bytes.length - (bytes.length % 2);
      pending = bytes.slice(usable);
      if (!usable) return;
      const samples = new Int16Array(bytes.buffer, 0, usable / 2);
      const floats = Float32Array.from(samples, (s) => s / 32768);
      const buffer = ctx.createBuffer(1, floats.length, 24000);
      buffer.copyToChannel(floats, 0);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      const start = playheadRef.current === 0 ? ctx.currentTime + 0.05 : Math.max(playheadRef.current, ctx.currentTime);
      src.start(start);
      playheadRef.current = start + buffer.duration;
      activeSourcesRef.current.push(src);
    };

    const ac = new AbortController();
    ttsAbortRef.current = ac;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { setError("Please sign in"); setStatus("idle"); return; }

    const url = `https://exynaicvgadoenjfunqz.supabase.co/functions/v1/voice-tts`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, voice: opts.voice || "alloy", region: opts.region || "India", language: opts.language || "en" }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) throw new Error(`TTS ${res.status}`);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const events = buf.split("\n\n");
        buf = events.pop() || "";
        for (const evt of events) {
          const line = evt.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const payload = JSON.parse(data);
            if (payload.type === "speech.audio.delta" && payload.audio) {
              const bin = atob(payload.audio);
              const arr = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
              scheduleChunk(arr);
            }
          } catch {}
        }
      }
      // wait for playback to finish
      const remaining = playheadRef.current - ctx.currentTime;
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining * 1000));
    } catch (e: any) {
      if (e?.name !== "AbortError") { setError(e?.message || "TTS error"); opts.onError?.(e?.message || "TTS error"); }
    } finally {
      if (ttsAbortRef.current === ac) ttsAbortRef.current = null;
      activeSourcesRef.current = [];
      setStatus("idle");
    }
  }, [opts, stopSpeaking]);

  const chatAndSpeak = useCallback(async (userText: string) => {
    setStatus("thinking");
    setReply("");
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { setError("Please sign in"); setStatus("idle"); return; }

    const url = `https://exynaicvgadoenjfunqz.supabase.co/functions/v1/voice-chat`;
    let fullReply = "";
    let spoken = 0;
    let ttsQueue = Promise.resolve();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          transcript: userText,
          language: opts.language || "en",
          history: history.slice(-8),
        }),
      });
      if (!res.ok || !res.body) throw new Error(`Chat ${res.status}`);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const events = buf.split("\n\n");
        buf = events.pop() || "";
        for (const evt of events) {
          const line = evt.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const payload = JSON.parse(data);
            const delta = payload.choices?.[0]?.delta?.content;
            if (delta) {
              fullReply += delta;
              setReply(fullReply);
              // Speak in sentence chunks for lower latency
              const sentenceMatch = fullReply.slice(spoken).match(/^[\s\S]*?[.!?…।]\s/);
              if (sentenceMatch) {
                const sentence = sentenceMatch[0];
                spoken += sentence.length;
                ttsQueue = ttsQueue.then(() => speak(sentence.trim()));
              }
            }
          } catch {}
        }
      }
      if (fullReply.slice(spoken).trim()) {
        ttsQueue = ttsQueue.then(() => speak(fullReply.slice(spoken).trim()));
      }
      await ttsQueue;
      setHistory((h) => [...h, { role: "user", content: userText }, { role: "assistant", content: fullReply }]);
    } catch (e: any) {
      setError(e?.message || "Chat error");
      opts.onError?.(e?.message || "Chat error");
      setStatus("idle");
    }
  }, [history, opts, speak]);

  const finishRecording = useCallback(async () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const chunks = pcmRef.current;
    const rate = ctx.sampleRate;
    cleanupCapture();
    pcmRef.current = [];
    if (!spokeRef.current || chunks.length === 0) { setStatus("idle"); return; }

    const blob = encodeWav(chunks, rate);
    if (blob.size < 2048) { setStatus("idle"); return; }

    setStatus("thinking");
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { setError("Please sign in"); setStatus("idle"); return; }

    const form = new FormData();
    form.append("file", blob, "recording.wav");
    if (opts.language && opts.language !== "auto") form.append("language", opts.language);

    let finalText = "";
    try {
      const res = await fetch(`https://exynaicvgadoenjfunqz.supabase.co/functions/v1/voice-transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok || !res.body) throw new Error(`STT ${res.status}`);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const events = buf.split("\n\n");
        buf = events.pop() || "";
        for (const evt of events) {
          const line = evt.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const data = line.slice(5).trim();
          if (!data) continue;
          try {
            const p = JSON.parse(data);
            if (p.type === "transcript.text.delta" && p.delta) {
              finalText += p.delta;
              setTranscript(finalText);
            } else if (p.type === "transcript.text.done" && p.text) {
              finalText = p.text;
              setTranscript(finalText);
            }
          } catch {}
        }
      }
      if (finalText.trim()) {
        await chatAndSpeak(finalText.trim());
      } else {
        setStatus("idle");
      }
    } catch (e: any) {
      setError(e?.message || "Transcription error");
      opts.onError?.(e?.message || "Transcription error");
      setStatus("idle");
    }
  }, [chatAndSpeak, cleanupCapture, opts]);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript("");
    setReply("");
    stopSpeaking();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createScriptProcessor(4096, 1, 1);
      nodeRef.current = node;
      pcmRef.current = [];
      spokeRef.current = false;
      silenceMsRef.current = 0;
      let lastTs = performance.now();

      node.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        pcmRef.current.push(new Float32Array(input));
        // Compute simple RMS for VAD
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
        const rms = Math.sqrt(sum / input.length);
        const now = performance.now();
        const dt = now - lastTs;
        lastTs = now;
        if (rms > 0.02) {
          spokeRef.current = true;
          silenceMsRef.current = 0;
        } else if (spokeRef.current) {
          silenceMsRef.current += dt;
          // 1.2s silence after speech → auto-stop
          if (silenceMsRef.current > 1200) {
            finishRecording();
          }
        }
      };
      source.connect(node);
      node.connect(ctx.destination);
      setStatus("listening");
    } catch (e: any) {
      setError("Microphone access denied");
      opts.onError?.("Microphone access denied");
      setStatus("idle");
    }
  }, [finishRecording, opts, stopSpeaking]);

  const stopListening = useCallback(() => {
    finishRecording();
  }, [finishRecording]);

  return {
    status, transcript, reply, history, error,
    startListening, stopListening, stopSpeaking, stopAll,
    isListening: status === "listening",
    isSpeaking: status === "speaking",
    isThinking: status === "thinking",
  };
}
