
# Farm Intellect SMS Layer — Complete A2Z Plan

> Goal: A farmer with a ₹500 keypad phone in rural Maharashtra/UP benefits from Farm Intellect **without touching a smartphone**, while keeping the existing web app untouched at its core.

---

## 0. TL;DR — Should you build this?

**Yes, build it.** It is the single highest-impact differentiator you can ship right now.
- ~55% of rural Indian phone users still use feature phones (TRAI / IAMAI 2024 estimates).
- Every existing agri-app (Kisan Suvidha, AgroStar, DeHaat, BharatAgri) is **smartphone-only**. Voice/SMS-first inclusion is an **open moat**.
- Cost to validate MVP: under ₹5,000 + 2 weeks of dev. Risk is low, learning is high.

**But** do NOT promise "AI advisory over SMS" on day 1. Start with **weather + mandi price + pest alert** in regional language. That alone changes lives.

---

## 1. ARCHITECTURE

### 1.1 Recommended stack

```text
 Keypad phone ──SMS/Missed call──► MSG91 / Gupshup ──Webhook──► Supabase Edge Function
                                                                       │
 Web app (existing) ──► Supabase DB ◄──── Cron (pg_cron + pg_net) ─────┤
                              │                                         │
                              └──► generate-alerts (existing) ──► sms-dispatcher (new)
                                                                       │
                                                          ──► Gupshup/MSG91 send API
```

### 1.2 SMS Gateway — pick **MSG91** for India

| Criterion | MSG91 ✅ | Gupshup | Twilio |
|---|---|---|---|
| Price/SMS (transactional, vernacular) | ₹0.18–0.25 | ₹0.20–0.30 | ₹0.45+ |
| DLT (TRAI) registration support | Built-in wizard | Yes | Manual, painful |
| Unicode (Hindi/Marathi/Telugu) | Native | Native | Native |
| Missed-call number rental | ✅ ₹500–1,500/mo | ✅ | ❌ India |
| IVR + WhatsApp BSP under one roof | ✅ | ✅ (stronger WA) | Partial |
| Indian support / GST invoice | ✅ | ✅ | ❌ |

**Decision:** MSG91 for SMS + missed call + IVR. Gupshup later for WhatsApp Business API.

### 1.3 End-to-end data flow

1. Farmer registered via web form / Sarpanch dashboard / missed call → row in `sms_subscribers`.
2. `pg_cron` triggers `generate-alerts` daily/weekly.
3. New edge function `sms-dispatcher` reads pending alerts + subscriber preferences, renders short vernacular template, calls MSG91, logs to `sms_log`.
4. Inbound: MSG91 webhook → `sms-inbound` edge function → parses keyword (PRICE WHEAT, STOP, HELP) → replies.
5. Missed call: MSG91 webhook → auto-subscribe + send confirmation SMS.

---

## 2. NEW FEATURES INSIDE THE EXISTING WEBSITE

| Feature | Where it lives | Who uses it |
|---|---|---|
| "Register for SMS Alerts" public form | New section on `/` (Index.tsx) + `/sms-register` | Anyone, even non-logged-in |
| Sarpanch / Krishi Sevak bulk register | New `/community-register` page, role `sevak` | Village leaders |
| Admin SMS console | New `/admin/sms` page | `admin` role |
| Missed-call subscribe banner | Homepage + printed posters | Farmers |
| SMS log + delivery dashboard | `/admin/sms/logs` | `admin` |

**Form fields (kept minimal — feature phone owners don't fill long forms; their relatives do):**
- Name, Mobile (10-digit), State, District (use existing `indianLocations.ts`), Primary crop, Language (22 langs), Consent checkbox (DLT compliance).

**Sarpanch dashboard:** CSV upload + inline table editor + "send test SMS" + village-level analytics (subscribers, delivery %, opt-outs).

---

## 3. SMS CONTENT DESIGN

### 3.1 Constraints
- **160 chars** for English / Latin script.
- **70 chars** for Unicode (Hindi/Marathi/Telugu/etc.) — this is a hard physics limit, not negotiable.
- → Plan content as **~65 vernacular characters** per SMS. Concatenated SMS works but each part is billed.

### 3.2 Weekly schedule (MVP)

| Day | Type | Example (Hindi, ~65 chars) |
|---|---|---|
| Mon | Weather 7-day | "नागपुर: मंगल-गुरु बारिश. छिड़काव टालें. Farm Intellect" |
| Tue | Mandi price (top 2 crops) | "नागपुर मंडी सोयाबीन ₹4850/qtl ▲3%. कपास ₹7200 ▼1%" |
| Wed | Pest/disease alert (geo + crop) | "कपास में गुलाबी सुंडी का खतरा. नीम तेल 5ml/L छिड़कें" |
| Thu | Govt scheme deadline | "PM-Kisan 19वीं किस्त: 28 तारीख तक eKYC करें" |
| Fri | Mandi price update | (same as Tue, refreshed) |
| Sat | Crop calendar reminder | "रबी गेहूं: सिंचाई का समय. CRI stage 20-25 दिन" |
| Sun | Tip / success story | Optional — keep cost down |

**Reply keywords:** `PRICE <CROP>`, `WEATHER`, `HELP`, `STOP`, `LANG HI/MR/TE…`.

### 3.3 Language pipeline
- Templates stored as i18n strings keyed by `(alert_type, lang)`.
- Use existing Sarvam AI for translation of dynamic parts (crop name, mandi name).
- Always pre-approve templates with DLT — TRAI requires it.

---

## 4. TECHNICAL IMPLEMENTATION

### 4.1 Database (migration sketch)

```sql
create table public.sms_subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,                       -- nullable; phone-only subs allowed
  name text not null,
  phone text not null unique,         -- E.164: +91XXXXXXXXXX
  state text not null,
  district text not null,
  crop text,
  language text not null default 'hi',
  source text not null default 'web', -- web | sevak | missed_call
  registered_by uuid,                 -- sevak/admin who added
  consent_at timestamptz not null default now(),
  active boolean not null default true,
  created_at timestamptz default now()
);

create table public.sms_log (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references sms_subscribers(id) on delete cascade,
  template_key text not null,
  body text not null,
  status text not null default 'queued', -- queued|sent|delivered|failed
  provider_msg_id text,
  cost_paise int,
  error text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table public.sms_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null,                  -- e.g. weather_weekly
  language text not null,
  body text not null,                 -- with {placeholders}
  dlt_template_id text,               -- TRAI-approved id
  unique(key, language)
);
```
RLS: subscribers self-view by phone-hash, sevaks view rows where `registered_by = auth.uid()`, admins all.

### 4.2 New edge functions

- `supabase/functions/sms-dispatcher/index.ts` — pulls due alerts, renders template, calls MSG91, writes `sms_log`.
- `supabase/functions/sms-inbound/index.ts` — webhook from MSG91 for replies.
- `supabase/functions/missed-call-webhook/index.ts` — auto-subscribe.
- Reuse existing `generate-alerts` for content generation.

**MSG91 send snippet:**
```ts
await fetch("https://control.msg91.com/api/v5/flow/", {
  method: "POST",
  headers: { authkey: Deno.env.get("MSG91_AUTH_KEY")!, "content-type": "application/json" },
  body: JSON.stringify({
    template_id: dltTemplateId,
    short_url: "0",
    recipients: [{ mobiles: phone, var1: cropName, var2: price }],
  }),
});
```

### 4.3 Cron (pg_cron + pg_net)
Schedule `sms-dispatcher` daily at 06:30 IST per alert type.

### 4.4 Frontend changes (minimal, additive)
- New page `src/pages/SmsRegister.tsx` (public).
- New section on `Index.tsx` "📱 No smartphone? Get free SMS alerts".
- New `src/pages/community/SevakDashboard.tsx`.
- New `src/pages/admin/AdminSms.tsx` + `AdminSmsLogs.tsx`.
- Reuse `indianLocations.ts`, `LanguageContext`.

### 4.5 Required secrets
`MSG91_AUTH_KEY`, `MSG91_SENDER_ID` (6-char), `MSG91_MISSED_CALL_NUMBER`, plus DLT principal entity ID.

---

## 5. COST & SCALE

| Scale | SMS/farmer/week | SMS/month | Cost @ ₹0.20 | Notes |
|---|---|---|---|---|
| 100 | 6 | 2,400 | ₹480 | Pilot, eat the cost |
| 1,000 | 6 | 24,000 | ₹4,800 | Sponsor: FPO / agri-input brand |
| 10,000 | 6 | 2.4 L | ₹48,000/mo | CSR + state govt MoU |
| 1,00,000 | 6 | 24 L | ₹4.8 L/mo | Move bulk to Gupshup contract @ ₹0.12, partner with state |

**Subscription model:**
- **Free tier:** 2 SMS/week (mandi + weather). Sponsor-funded.
- **Pro (₹49/yr or ₹5/mo via UPI/sevak collection):** daily, pest, scheme deadlines, IVR call-back.
- **B2B2C:** FPOs, seed/fertilizer brands sponsor entire villages (high willingness to pay).

---

## 6. IMPACT & DIFFERENTIATION

- **Today:** every Indian agri-app is smartphone-only. ~45% of rural farmers are excluded.
- **You become:** "India's first truly inclusive agri-platform — works on a ₹500 phone, in your language, no internet."
- **Distribution moat:** Sarpanch/Krishi Sevak/ADO partnerships. One sevak = 100–500 farmers onboarded in a day. Government and NABARD actively fund such initiatives.
- **PR / pitch line:** *"From 4G dashboards to 2G SMS — Farm Intellect reaches every Indian farmer."* This is investor + grant catnip (Bill & Melinda Gates Foundation, Omidyar, Bharat Inclusion Initiative all fund this exact thesis).

---

## 7. FUTURE EXPANSION (phased)

- **Phase 2:** IVR — farmer dials a number, hears today's mandi price in own language (TTS via Sarvam).
- **Phase 3:** Missed-call price checker — `Give missed call to 080-XXXX-XXXX → get SMS with today's price for your registered crop`.
- **Phase 4:** WhatsApp Business API via Gupshup — for the ~30% of farmers on basic smartphones with WA but no app installs.
- **Phase 5:** USSD (`*123#`) menu — works even on phones with no SMS pack.
- **Phase 6:** Voice-bot AI advisory in Hindi/Marathi via Sarvam + Gemini.

---

## 8. HONEST GAPS & FAILURE ANALYSIS (the part nobody tells you)

### What can fail
| Risk | Probability | Mitigation |
|---|---|---|
| **DLT rejection / template delays** (TRAI) | High at first | Pre-register 20 templates week 1; use only approved variables |
| **SMS delivery rate <90%** in rural circles | Medium | Multi-vendor failover (MSG91 → Gupshup) |
| **Wrong number / family member's phone** | High | Confirmation SMS + missed-call verification |
| **Language mismatch** (farmer literate only in spoken, not script) | Very high | Add IVR fast; keep SMS text super simple |
| **Farmer opts out after 2 weeks** ("too many messages") | High | Cap at 4/week MVP, let user choose frequency |
| **Sevak fakes registrations to claim incentives** | Medium | OTP/missed-call confirm before activation |
| **Mandi data is stale or wrong** | High | Show date + source; never quote without timestamp |
| **Cost runs away** | Medium | Hard monthly cap per subscriber, alert at 80% |

### Honest expected delivery / engagement (Indian benchmarks)
- DLT-approved transactional SMS delivery: **88–94%**.
- Read rate of vernacular SMS in rural India: **60–75%** (vs WhatsApp ~95%).
- Action/reply rate: **3–8%** (very good for SMS).
- 30-day retention if content is useful: **~55%**. If generic: **<20%**.

### What you are NOT doing yet (be honest)
- No 2-way AI conversation (too expensive and brittle on SMS).
- No personalized soil/satellite advisory over SMS — only at village granularity.
- No payment collection from farmer directly — go through sevak/FPO.
- No real-time pest image diagnosis on feature phone (impossible without camera + data).

---

## 9. WILL THEY ACTUALLY USE IT? — Persona-by-persona truth

### 🧑‍🌾 Farmer (Ramesh, 48, 3 acres, Wardha)
- **Why YES:** Mandi price = direct ₹ in pocket. Weather warning saved one spray = ₹800 saved. Free. In Marathi. No app to install. His son already gets junk SMS — one useful one is welcome.
- **Why NO:** "Too many SMS, I delete without reading." "I don't trust unknown sender." "Price was wrong once." → Solved by sevak intro + sender ID branding (`KSARTH`) + accuracy.

### 🧑‍💼 Merchant (Mandi trader)
- **Why YES:** Wants reach to farmers to announce buying rates. Will pay to push "Today I'm buying soybean at ₹5,000" SMS to 500 nearby farmers.
- **Why NO:** Doesn't want to be regulated. → Offer simple self-serve "boost" feature, ₹2/SMS, pre-paid wallet.

### 🛡️ Admin / NGO / Govt officer
- **Why YES:** Finally a dashboard showing village-level reach, opt-in rates, schemes uptake. Great for monthly reports.
- **Why NO:** Worried about data privacy / Aadhaar. → Don't store Aadhaar at all for SMS subs. Keep data in India region.

### 👨‍🌾 Sarpanch / Krishi Sevak
- **Why YES:** Power + visibility in village. Small incentive (₹5/active subscriber/month) keeps them motivated.
- **Why NO:** Effort fatigue. → Pre-printed registration cards, WhatsApp group support, monthly leaderboard.

---

## 10. MARKET VALIDATION & GO/NO-GO

### Market size (TAM)
- 14.6 cr Indian farmer households (Agri Census 2021).
- ~55% on feature phones / shared phones = **~8 cr addressable**.
- Even at 1% = 8 lakh users. At ₹49/yr Pro conversion of 5% = **₹2 Cr ARR** + sponsor revenue + B2B2C.

### Comparable proof
- **Reuters Market Light (RML)** — ran 2007–2014, 2 lakh+ paying farmers via SMS at ₹60/quarter. Closed only because RML pivoted, not because demand died. **Demand is proven.**
- **IFFCO Kisan, Digital Green** — operate similar models successfully today.
- WhatsApp-only competitors (BharatAgri etc.) leave the feature-phone segment wide open.

### Validation experiment (do this BEFORE building all features)
1. Print 200 paper flyers with a missed-call number.
2. Distribute via 2 sevaks in 2 villages.
3. Measure: missed-calls received in 1 week, opt-in rate, language requested.
4. **Go criteria:** ≥80 missed calls, ≥40 confirmations, ≥10 unsolicited "send more" replies. **Stop criteria:** <20 missed calls → fix message/positioning, don't build more.

### Final recommendation
**GO.** This is one of the rare features that simultaneously:
- expands TAM by 4x,
- creates a defensible moat (DLT + sevak network are not copy-pasteable),
- attracts non-dilutive funding (CSR, NABARD, BIRAC, Gates),
- and has crystal-clear unit economics.

**Don't go** only if you cannot commit to (a) 12 months of operations and (b) one human in the loop to handle DLT, complaints, and sevak training. SMS without ops = dead channel in 60 days.

---

## 11. PHASED ROLLOUT (concrete)

| Phase | Weeks | Scope | Success metric |
|---|---|---|---|
| **0. Validate** | 1–2 | Missed-call flyer test in 2 villages | ≥80 missed calls |
| **1. MVP** | 3–6 | DLT + MSG91 + 5 templates + web register form + basic sms_dispatcher | 500 active subs, 90% delivery |
| **2. Sevak layer** | 7–10 | Bulk-register dashboard, leaderboard, incentives | 5,000 subs across 20 villages |
| **3. 2-way + missed call** | 11–14 | Keyword replies, missed-call price checker, IVR pilot | 25% farmers use ≥1 reply/month |
| **4. Monetize** | 15–20 | Pro tier ₹49/yr, merchant boost, sponsor pages | ₹50k MRR |
| **5. WhatsApp + IVR scale** | 21+ | Gupshup WA BSP, full Hindi voice bot | 50k subs, 3-state ops |

---

## 12. QUESTIONS I NEED YOU TO ANSWER BEFORE I START CODING

1. **Pilot geography** — start in Maharashtra, UP, both, or your home district? (affects DLT entity, language priority, sevak partners)
2. **DLT registration** — do you already have a registered Principal Entity on Jio/Airtel/Vi DLT portal? (mandatory; takes 2–5 days)
3. **Funding the SMS bill for pilot** — self-funded ₹5k, or should I design a sponsor-page / FPO partnership flow first?
4. **Sevak incentive model** — flat fee per registration, or revenue share on Pro upgrades?
5. **Languages on day 1** — Hindi + Marathi only, or full 22? (start with 2; you can scale templates later)
6. **Missed-call number** — rent a 10-digit virtual number (~₹1,500/mo) or shared shortcode?
7. **Brand sender ID** — `KSARTH`, `KRISHI`, `KSRTHI`? (pick now; DLT-locked once approved)
8. **Privacy stance** — store farmer phone hashed or plain? My recommendation: plain (needed for sending) + strict RLS + 24-month retention, no Aadhaar ever.

---

Reply with answers (or "use your defaults") and I'll start with the migration + MSG91 edge function + the public SMS-registration form on the homepage.
