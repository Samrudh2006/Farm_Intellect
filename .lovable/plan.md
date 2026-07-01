## Part 1 — Vercel "old version" (not a code fix)

Your Lovable preview and `farm-intellect-65.lovable.app` are always in sync with the latest edits. Your **Vercel deployment is a separate pipeline** connected to your GitHub repo (`farming-gamma.vercel.app`). Vercel shows an old version because one of these is true — no code change on my side can fix it:

1. **GitHub is behind Lovable.** Lovable pushes to GitHub only when the GitHub sync is connected and healthy. Open GitHub and check if the latest commits are actually there.
2. **Vercel isn't auto-deploying that branch.** In Vercel → Project → Settings → Git, confirm the Production Branch matches the branch Lovable pushes to (usually `main`).
3. **Vercel deploy failed.** Your screenshot shows two red "Error" deploys at the top — those failed builds mean Vercel is still serving the last "Ready" build from Jun 9. Click the failed deploy → View Build Logs → fix the error (usually a missing env var like `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel → Settings → Environment Variables).
4. **Env vars missing on Vercel.** Even if the build succeeds, missing Supabase env vars produce a working-looking app with no data. Copy them from your local `.env` into Vercel's env settings for Production.

**My recommendation:** stop using Vercel and use Lovable's own hosting (`farm-intellect-65.lovable.app`) — same code, no drift, no double-deploy. If you must keep Vercel, fix the failed builds first.

I will not attempt "fixes" for a deploy pipeline I can't observe. Tell me which of the four above matches and I'll help from there.

## Part 2 — Voice Agent Overhaul (this is what I'll build)

Rebuild the voice assistant on Lovable AI Gateway (OpenAI `gpt-4o-mini-transcribe` for STT, `gpt-4o-mini-tts` for TTS, `google/gemini-3-flash-preview` for reasoning). No new API keys needed — `LOVABLE_API_KEY` is already set.

### Files to create

**Backend (Supabase Edge Functions):**
- `supabase/functions/voice-transcribe/index.ts` — Streams STT. Accepts multipart audio (WAV), returns SSE transcript deltas. Auto language detect.
- `supabase/functions/voice-chat/index.ts` — Takes transcript + user profile (name, state, district, crops, preferred voice) + conversation history from `voice_conversations` table. Streams a natural, short, human-style reply in the user's language via `google/gemini-3-flash-preview`. System prompt tuned for: contractions, filler words ("hmm", "so"), no bullet lists, no "As an AI".
- `supabase/functions/voice-tts/index.ts` — Streams PCM audio SSE from `gpt-4o-mini-tts` using the user's preferred voice + `instructions` for regional accent/warmth.

**Frontend:**
- `src/hooks/useHumanVoiceAgent.ts` — Web Audio API PCM capture → WAV upload; SSE playback with interruption (stop TTS the moment mic detects speech via VAD threshold on input volume); barge-in re-triggers STT.
- `src/components/features/HumanVoiceAgent.tsx` — Redesigned UI: waveform, live transcript, "speaking/listening/thinking" states, voice picker (alloy/nova/onyx/shimmer), language auto-shown from profile.
- Replace `MultiLanguageVoiceAssistant` internals with the new hook while keeping the same public component so existing routes work.

**Database:**
- Migration: `voice_conversations` table (id, user_id, messages jsonb, language, created_at) with RLS scoped to `auth.uid()`, plus a `preferred_voice` column on `profiles`.

### How "human-like" is achieved
- **Model prompt engineering**: strict style rules — 1–3 sentences, contractions, no lists, natural pauses via `...`, use the farmer's name and crop context.
- **TTS `instructions` param**: e.g. "Warm, unhurried Indian English farmer-friend tone. Slight regional accent for {state}. Never robotic."
- **Interruptions**: client monitors mic input volume during TTS playback; when it crosses threshold for >200ms, cancels the audio playhead, aborts the TTS fetch, and starts recording immediately.
- **Personalization**: every request injects `{displayName, state, district, crops[], preferredVoice, language}` from `profiles` + `crop_plans` into the system prompt.

### Realistic scope note
- "Zero percent AI-sounding" isn't achievable with any current TTS — this will be *noticeably* more human than the current Sarvam flow, but not indistinguishable from a real person. ElevenLabs would get closer; you chose Lovable AI, which is what I'll use.
- "Enhance 10+ things across the app" is too vague to action safely. After the voice agent lands and you confirm it works, tell me the *specific* areas (e.g. "farmer dashboard loading speed", "crop scanner accuracy", "notifications UI") and I'll tackle them one focused pass at a time.

### Out of scope this turn
- Vercel pipeline (see Part 1)
- General "enhance everything" — needs concrete targets
- ElevenLabs (you chose Lovable AI)

Approve and I'll build Part 2.