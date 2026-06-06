# Farm Intellect — Architecture Diagram (Text-Based)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                     │
│    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐          │
│    │   Farmer      │   │  Merchant    │   │   Expert     │          │
│    │   Browser     │   │  Browser     │   │   Browser    │          │
│    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘          │
│           │                  │                   │                   │
│           │           ┌──────────────┐           │                   │
│           │           │    Admin     │           │                   │
│           │           │   Browser    │           │                   │
│           │           └──────┬───────┘           │                   │
└───────────┼──────────────────┼───────────────────┼──────────────────┘
            │                  │                   │
            ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite + TypeScript)                 │
│                                                                       │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ Landing Page │ │ Farmer       │ │ Merchant   │ │ Expert       │  │
│  │ + Auth      │ │ Dashboard    │ │ Dashboard  │ │ Dashboard    │  │
│  │ + Login     │ │ + Crops      │ │ + Farmers  │ │ + AI Scanner │  │
│  │ + Register  │ │ + Advisory   │ │ + Prices   │ │ + Advisory   │  │
│  └─────────────┘ └──────────────┘ └────────────┘ └──────────────┘  │
│                                                                       │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ Admin       │ │ Chat +       │ │ Forum +    │ │ Voice        │  │
│  │ Dashboard   │ │ Socket.IO    │ │ Community  │ │ Assistant    │  │
│  │ + Users     │ │ Real-time    │ │ Posts      │ │ (Sarvam AI)  │  │
│  │ + Analytics │ │ Messaging    │ │ Comments   │ │ STT + TTS    │  │
│  └─────────────┘ └──────────────┘ └────────────┘ └──────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Shared: Weather │ Sensors │ Field Map │ Calendar │ Documents   │ │
│  │ Notifications │ Schemes │ Polls │ Profile │ Features Showcase  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Tech: React 18 │ Radix UI + shadcn/ui │ Tailwind CSS │ TanStack   │
│  Query │ React Router DOM │ Framer Motion │ Recharts │ Zod          │
│                                                                       │
│  Hosted on: Vercel (SPA with rewrites)                               │
└──────────┬──────────────────┬──────────────────┬────────────────────┘
           │ HTTPS / REST     │ WebSocket        │ Direct Client
           │                  │ (Socket.IO)      │
           ▼                  ▼                  ▼
┌─────────────────────────────────────┐  ┌──────────────────────────┐
│    BACKEND API (Express + Node.js)   │  │  SUPABASE (Auth + DB)    │
│    Single Monolith Service           │  │                          │
│                                       │  │  - User authentication  │
│  ┌─────────────────────────────────┐ │  │  - Session management   │
│  │          API ROUTES             │ │  │  - Profile sync         │
│  │                                 │ │  │  - Role management      │
│  │  /api/auth/*     Auth + OTP     │ │  │  - RLS policies         │
│  │  /api/users/*    Profile + RBAC │ │  │                          │
│  │  /api/ai/*       AI advisory    │ │  │  PostgreSQL (managed)   │
│  │  /api/chat/*     Chat + Voice   │ │  │  Auth (managed)         │
│  │  /api/forum/*    Posts + Comment│ │  │                          │
│  │  /api/documents/*  Upload/Verify│ │  │  Free tier              │
│  │  /api/calendar/* Crop calendar  │ │  └──────────────────────────┘
│  │  /api/analytics/*  Dashboards   │ │
│  │  /api/notifications/*  Alerts   │ │  ┌──────────────────────────┐
│  │  /health          Health check  │ │  │  CURATED DATASETS        │
│  └─────────────────────────────────┘ │  │  (src/data/*)            │
│                                       │  │                          │
│  ┌───────────────────────────────────────┐  │  - 60+ crop varieties   │
│  │            CORE MODULES               │  │  - 50+ pest profiles    │
│  │                                       │  │  - Soil health params   │
│  │  ┌───────────────┐ ┌───────────────┐ │  │  - 1500+ calendar acts  │
│  │  │ AI Advisory   │ │ Chat Engine   │ │  │  - Mandi prices (50+)   │
│  │  │ Engine        │ │               │ │  │  - Crop diseases DB     │
│  │  │               │ │ - AI chat     │ │  │  - Satellite data       │
│  │  │ - Crop recs   │ │ - Message     │ │  │  - Kisan call center    │
│  │  │ - Disease     │ │   history     │ │  │  - Fertilizer recs      │
│  │  │   detection   │ │ - Voice STT   │ │  │  - Location DB          │
│  │  │ - Yield       │ │ - Voice TTS   │ │  │                          │
│  │  │   prediction  │ │ - Session mgmt│ │  │  Resolved client-side   │
│  │  │ - Preventive  │ │               │ │  │  for fast lookups       │
│  │  │   tips        │ │               │ │  └──────────────────────────┘
│  │  └───────┬───────┘ └───────┬───────┘ │
│  │          │                 │          │
│  │  ┌───────┴───────┐ ┌──────┴────────┐ │
│  │  │ Document      │ │ Forum &       │ │
│  │  │ Management    │ │ Community     │ │
│  │  │               │ │               │ │
│  │  │ - Upload      │ │ - Posts CRUD  │ │
│  │  │   (Multer)    │ │ - Comments    │ │
│  │  │ - Verify flow │ │ - Moderation  │ │
│  │  │ - File types  │ │ - Categories  │ │
│  │  │ - Size limits │ │ - Search      │ │
│  │  └───────────────┘ └───────────────┘ │
│  │                                       │
│  │  ┌───────────────┐ ┌───────────────┐ │
│  │  │ Notification  │ │ Analytics     │ │
│  │  │ Engine        │ │ Engine        │ │
│  │  │               │ │               │ │
│  │  │ - Email       │ │ - Role-based  │ │
│  │  │   (Nodemailer)│ │   dashboards  │ │
│  │  │ - SMS (Twilio)│ │ - Activity    │ │
│  │  │ - In-app      │ │   tracking    │ │
│  │  │ - Socket.IO   │ │ - 7d/30d/90d  │ │
│  │  │   real-time   │ │   timeframes  │ │
│  │  └───────────────┘ └───────────────┘ │
│  └───────────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │         MIDDLEWARE STACK        │ │
│  │                                 │ │
│  │  Helmet → CORS → Rate Limiter  │ │
│  │  → JWT Auth → RBAC → Validator │ │
│  │  → Error Handler → Logger      │ │
│  └─────────────────────────────────┘ │
│                                       │
│  Tech: Express 4.18 │ Prisma ORM │ JWT │ Bcrypt │ Socket.IO    │
│  Winston Logger │ express-validator │ Multer │ UUID             │
│                                                                   │
│  Hosted on: Railway / VPS (~$5-10/mo)                            │
└──────────┬───────────────────┬──────────────────┬───────────────┘
           │                   │                  │
           ▼                   ▼                  ▼
┌──────────────────┐ ┌─────────────────┐  ┌────────────────────────┐
│  SQLite / Prisma │ │  Socket.IO      │  │  Sarvam AI API         │
│  (Primary DB)    │ │  (Real-time)    │  │  (Indian LLM)          │
│                  │ │                 │  │                        │
│  - Users         │ │  - Chat rooms   │  │  - Chat completions    │
│  - Farmer/       │ │  - Presence     │  │    (sarvam-30b)        │
│    Merchant/     │ │  - Live notifs  │  │  - Speech-to-text      │
│    Expert        │ │  - JWT auth     │  │    (saaras:v3)         │
│    Profiles      │ │  - User rooms   │  │  - Text-to-speech      │
│  - Documents     │ │                 │  │    (bulbul:v3)         │
│  - Chat Messages │ │  Embedded in    │  │  - Multi-language      │
│  - Forum Posts   │ │  Express server │  │    (Hi/Pn/En/...)      │
│  - Comments      │ │                 │  │                        │
│  - Notifications │ │                 │  │  ~$0.001/request       │
│  - Activities    │ │                 │  │  Pay-per-use           │
│  - Crop Calendar │ └─────────────────┘  └────────────────────────┘
│  - AI Recs       │
│  - OTP Codes     │  ┌─────────────────┐  ┌────────────────────────┐
│                  │  │  Twilio         │  │  Nodemailer            │
│  SQLite (dev)    │  │  (SMS/WhatsApp) │  │  (Email SMTP)          │
│  → Postgres      │  │                 │  │                        │
│  (production)    │  │  - OTP delivery │  │  - OTP delivery        │
│                  │  │  - Alerts       │  │  - Notifications       │
│  Free (SQLite)   │  │  Pay-per-use    │  │  Free / SMTP plan      │
└──────────────────┘  └─────────────────┘  └────────────────────────┘
```

---

## Component Breakdown

### 1. AI Advisory Engine

```
┌─────────────────────────────────────────────────────┐
│              AI ADVISORY ENGINE                       │
│                                                       │
│  Input: {role, location, soil_type, season, crops}   │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ Feature 1: CROP RECOMMENDATIONS             │    │
│  │                                               │    │
│  │  Input: location, soil, season, farm_size,   │    │
│  │         experience                            │    │
│  │  Process:                                     │    │
│  │    1. Query curated crop datasets             │    │
│  │    2. Match soil type → suitable crops        │    │
│  │    3. Filter by season + climate zone         │    │
│  │    4. Rank by yield potential + market price  │    │
│  │  Output: top_crops[], confidence, reasoning   │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ Feature 2: DISEASE DETECTION (ML)           │    │
│  │                                               │    │
│  │  Input: crop_image (upload)                   │    │
│  │  Process:                                     │    │
│  │    1. Accept image via Multer                 │    │
│  │    2. Run through disease classification      │    │
│  │       model (mock → future TensorFlow)        │    │
│  │    3. Cross-reference cropDiseases dataset    │    │
│  │    4. Lookup pestData for treatment           │    │
│  │  Output: {disease, confidence, severity,      │    │
│  │           treatment, prevention}              │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ Feature 3: YIELD PREDICTION                  │    │
│  │                                               │    │
│  │  Input: cropType, farmSize, soilQuality,     │    │
│  │         irrigation, fertilizer, weather       │    │
│  │  Process:                                     │    │
│  │    1. Normalize input parameters              │    │
│  │    2. Apply prediction model                  │    │
│  │    3. Calculate confidence intervals          │    │
│  │  Output: {predicted_yield, confidence,        │    │
│  │           risk_factors[], optimal_actions[]}   │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ Feature 4: PREVENTIVE TIPS (Expert-only)    │    │
│  │                                               │    │
│  │  Input: expert_role, region                   │    │
│  │  Output: seasonal pest alerts, IPM           │    │
│  │          strategies, treatment timelines      │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  POST-MVP: Integrate real ML models (PlantVillage  │
│  dataset), satellite-based crop health monitoring   │
└─────────────────────────────────────────────────────┘
```

### 2. Chat & Voice Pipeline

```
┌─────────────────────────────────────────────────────────┐
│              CHAT & VOICE PIPELINE                        │
│                                                           │
│  Input: {user_id, message|audio, mode, language}         │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Mode 1: TEXT CHAT (Sarvam AI)               │        │
│  │                                               │        │
│  │  1. Receive user message                     │        │
│  │  2. Build role-aware system prompt:          │        │
│  │     - Farmer: simple language, practical     │        │
│  │     - Expert: technical, research-backed     │        │
│  │  3. Include chat history (last 12 messages)  │        │
│  │  4. Call Sarvam API (sarvam-30b model)       │        │
│  │     - Temperature: 0.3                       │        │
│  │     - Max tokens: 700                        │        │
│  │  5. Store message + response in DB           │        │
│  │  6. Return AI response                       │        │
│  │                                               │        │
│  │  Modes: chat | disease | recommendation |    │        │
│  │         yield                                │        │
│  └───────────────────┬─────────────────────────┘        │
│                      ▼                                    │
│  ┌─────────────────────────────────────────────┐        │
│  │ Mode 2: VOICE INPUT (Speech-to-Text)        │        │
│  │                                               │        │
│  │  1. User records audio in browser            │        │
│  │  2. Audio sent to POST /api/chat/voice/      │        │
│  │     transcribe                                │        │
│  │  3. Forward to Sarvam STT API (saaras:v3)   │        │
│  │  4. Modes: transcribe | translate |          │        │
│  │     transliterate | code-mix                  │        │
│  │  5. Return text transcription                │        │
│  │  6. Feed into text chat pipeline             │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Mode 3: VOICE OUTPUT (Text-to-Speech)       │        │
│  │                                               │        │
│  │  1. AI response text available                │        │
│  │  2. Call Sarvam TTS API (bulbul:v3)          │        │
│  │  3. Configure: speaker, pace, language       │        │
│  │  4. Return base64 audio to frontend          │        │
│  │  5. Play audio in browser                    │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Mode 4: REAL-TIME (Socket.IO)               │        │
│  │                                               │        │
│  │  1. JWT authenticated WebSocket handshake    │        │
│  │  2. User joins room: user-{userId}           │        │
│  │  3. Live message delivery                    │        │
│  │  4. Typing indicators + presence             │        │
│  │  5. Real-time notification push              │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  Language Support: English, Hindi, Punjabi,              │
│  Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi,    │
│  Gujarati, Odia + code-mixed (Hinglish, Punjlish)      │
└─────────────────────────────────────────────────────────┘
```

### 3. Authentication & Authorization

```
┌─────────────────────────────────────────────────────────┐
│           AUTHENTICATION & AUTHORIZATION                 │
│                                                           │
│  DUAL AUTH ARCHITECTURE (Hybrid)                         │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Layer 1: SUPABASE AUTH (Identity Provider)  │        │
│  │                                               │        │
│  │  - Email + password sign-up/login            │        │
│  │  - Session management (JWT)                  │        │
│  │  - Profile table with role column            │        │
│  │  - Row-Level Security (RLS) policies         │        │
│  │  - Auto-profile creation on sign-up          │        │
│  │  - Password reset flow                       │        │
│  │                                               │        │
│  │  Tables: auth.users, public.profiles         │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Layer 2: BACKEND JWT (API Protection)       │        │
│  │                                               │        │
│  │  1. POST /api/auth/signup                    │        │
│  │     → Hash password (bcrypt, 12 rounds)      │        │
│  │     → Create user + role profile             │        │
│  │     → Generate OTP, send via Email/SMS       │        │
│  │     → Return JWT token                       │        │
│  │                                               │        │
│  │  2. POST /api/auth/login                     │        │
│  │     → Verify password                        │        │
│  │     → Check email verification               │        │
│  │     → 2FA for Admin/Expert (OTP)             │        │
│  │     → Return JWT (payload: userId, role)     │        │
│  │                                               │        │
│  │  3. Middleware: authenticate()                │        │
│  │     → Extract Bearer token from header       │        │
│  │     → Verify JWT signature                   │        │
│  │     → Attach user to req.user                │        │
│  │                                               │        │
│  │  4. Middleware: authorize(roles[])            │        │
│  │     → Check req.user.role ∈ allowedRoles     │        │
│  │     → 403 Forbidden if unauthorized          │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Layer 3: SOCKET.IO AUTH                     │        │
│  │                                               │        │
│  │  - JWT passed in WebSocket handshake         │        │
│  │  - Verify token on connection                │        │
│  │  - Room isolation: user-{userId}             │        │
│  │  - Message sender validation                 │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ROLE-BASED ACCESS CONTROL (RBAC):                      │
│  ┌──────────────────┬───────────────────────────────┐   │
│  │ FARMER           │ crops, advisory, chat, forum   │   │
│  │                  │ weather, sensors, calendar     │   │
│  │ MERCHANT         │ farmers list, market prices    │   │
│  │                  │ documents, notifications       │   │
│  │ EXPERT           │ AI scanner, advisory, chat     │   │
│  │                  │ forum (auto-approved posts)    │   │
│  │ ADMIN            │ all routes + user mgmt         │   │
│  │                  │ analytics + system settings    │   │
│  └──────────────────┴───────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 4. Database Schema (SQLite → PostgreSQL)

```
┌─────────────────────────────────────────────────────────┐
│           DATA MODEL (Prisma ORM + SQLite)               │
│                                                           │
│  For MVP, SQLite for zero-config local development.      │
│  Prisma abstraction allows migration to PostgreSQL       │
│  in production with zero code changes.                   │
│                                                           │
│  Table: users                                            │
│  ┌──────────────────┬────────────┬─────────────────────┐│
│  │ id               │ UUID (PK)  │                     ││
│  │ email            │ STRING     │ unique              ││
│  │ password         │ STRING     │ bcrypt hashed       ││
│  │ name             │ STRING     │                     ││
│  │ phone            │ STRING?    │                     ││
│  │ location         │ STRING?    │                     ││
│  │ role             │ ENUM       │ FARMER/MERCHANT/    ││
│  │                  │            │ EXPERT/ADMIN        ││
│  │ isVerified       │ BOOLEAN    │ default: false      ││
│  │ emailVerified    │ BOOLEAN    │                     ││
│  │ phoneVerified    │ BOOLEAN    │                     ││
│  │ profileImage     │ STRING?    │                     ││
│  │ createdAt        │ TIMESTAMP  │                     ││
│  │ updatedAt        │ TIMESTAMP  │                     ││
│  └──────────────────┴────────────┴─────────────────────┘│
│                                                           │
│  Table: farmer_profiles                                  │
│  ┌──────────────────┬────────────┬─────────────────────┐│
│  │ userId           │ FK → users │ 1:1                 ││
│  │ farmSize         │ FLOAT      │ hectares            ││
│  │ cropTypes        │ JSON       │ string array        ││
│  │ experience       │ INT        │ years               ││
│  │ latitude         │ FLOAT?     │ geo-location        ││
│  │ longitude        │ FLOAT?     │                     ││
│  └──────────────────┴────────────┴─────────────────────┘│
│                                                           │
│  Table: merchant_profiles                                │
│  ┌──────────────────┬────────────┬─────────────────────┐│
│  │ userId           │ FK → users │ 1:1                 ││
│  │ businessName     │ STRING     │                     ││
│  │ businessType     │ STRING     │                     ││
│  │ yearsInBusiness  │ INT        │                     ││
│  │ rating           │ FLOAT      │ 0-5                 ││
│  │ latitude         │ FLOAT?     │                     ││
│  │ longitude        │ FLOAT?     │                     ││
│  └──────────────────┴────────────┴─────────────────────┘│
│                                                           │
│  Table: expert_profiles                                  │
│  ┌──────────────────┬────────────┬─────────────────────┐│
│  │ userId           │ FK → users │ 1:1                 ││
│  │ specialization   │ STRING     │                     ││
│  │ experience       │ INT        │ years               ││
│  │ rating           │ FLOAT      │ 0-5                 ││
│  │ consultations    │ INT        │ count               ││
│  └──────────────────┴────────────┴─────────────────────┘│
│                                                           │
│  Table: documents                                        │
│  ┌──────────────────┬────────────┬─────────────────────┐│
│  │ userId           │ FK → users │                     ││
│  │ type             │ ENUM       │ ID/ADDRESS/LAND/    ││
│  │                  │            │ LICENSE/OTHER       ││
│  │ fileName         │ STRING     │                     ││
│  │ filePath         │ STRING     │                     ││
│  │ mimeType         │ STRING     │                     ││
│  │ size             │ INT        │ bytes               ││
│  │ isVerified       │ BOOLEAN    │                     ││
│  └──────────────────┴────────────┴─────────────────────┘│
│                                                           │
│  Table: chat_messages                                    │
│  ┌──────────────────┬────────────┬─────────────────────┐│
│  │ userId           │ FK → users │                     ││
│  │ message          │ TEXT       │                     ││
│  │ type             │ ENUM       │ USER/AI_ASSISTANT   ││
│  │ context          │ JSON?      │ mode, language, etc ││
│  └──────────────────┴────────────┴─────────────────────┘│
│                                                           │
│  Table: posts + comments + notifications +               │
│  activities + crop_calendar + ai_recommendations +       │
│  otp_codes                                               │
│                                                           │
│  POST-MVP: Migrate SQLite → PostgreSQL (Railway/         │
│  Supabase) for concurrent writes + full-text search +    │
│  production reliability                                  │
└─────────────────────────────────────────────────────────┘
```

### 5. Curated Agricultural Knowledge Layer

```
┌─────────────────────────────────────────────────────────┐
│        AGRICULTURAL KNOWLEDGE LAYER (src/data/*)         │
│                                                           │
│  This layer is resolved CLIENT-SIDE for instant lookups. │
│  No API calls needed — data bundled in the frontend.     │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ cropsData.ts (60+ varieties)                │        │
│  │                                               │        │
│  │ Per crop: name, type, season, optimal temp,  │        │
│  │ soil type, water needs, growth duration,      │        │
│  │ yield per hectare, market price, MSP,         │        │
│  │ nutritional info, storage guidelines          │        │
│  │                                               │        │
│  │ Categories: Cereals, Pulses, Oilseeds,       │        │
│  │ Vegetables, Fruits, Cash Crops, Spices       │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ cropDiseases.ts (50+ diseases)              │        │
│  │                                               │        │
│  │ Per disease: name, type (fungal/bacterial/   │        │
│  │ viral/pest), affected crops, symptoms,        │        │
│  │ severity, treatment (chemical + organic),     │        │
│  │ prevention, favorable conditions              │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ pestData.ts (30+ pests)                     │        │
│  │                                               │        │
│  │ Per pest: species, lifecycle stages, host    │        │
│  │ crops, damage symptoms, IPM strategies       │        │
│  │ (cultural, biological, chemical), seasonal   │        │
│  │ activity, economic threshold levels          │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ cropCalendar.ts (1500+ activities)          │        │
│  │                                               │        │
│  │ Per activity: crop, week, zone (AICRPAM),   │        │
│  │ stage (sowing/growth/harvest), task type     │        │
│  │ (irrigation, fertilizer, pest control),       │        │
│  │ description, dependencies                     │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ mandiPrices.ts (50+ markets)                │        │
│  │                                               │        │
│  │ Per market: location, commodity, modal price,│        │
│  │ min/max price, arrivals (tonnes), date,       │        │
│  │ MSP comparison, price trend                   │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ soilHealth.ts (12 parameters)               │        │
│  │                                               │        │
│  │ Parameters: pH, EC, Nitrogen, Phosphorus,    │        │
│  │ Potassium, Sulphur, Zinc, Iron, Manganese,  │        │
│  │ Boron, Copper, Organic Carbon                 │        │
│  │                                               │        │
│  │ Per parameter: optimal range, deficiency     │        │
│  │ symptoms, correction methods, crop impact    │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  Also includes: cropProduction.ts,                      │
│  cropRecommendations.ts, satelliteData.ts,              │
│  indianLocations.ts, kisanCallCenter.ts                 │
└─────────────────────────────────────────────────────────┘
```

### 6. Notification & Communication Engine

```
┌─────────────────────────────────────────────────────────┐
│         NOTIFICATION & COMMUNICATION ENGINE               │
│                                                           │
│  MULTI-CHANNEL DELIVERY:                                 │
│  ┌─────────────────────────────────────────────┐        │
│  │ Channel 1: IN-APP NOTIFICATIONS             │        │
│  │                                               │        │
│  │  - Stored in notifications table              │        │
│  │  - Types: INFO, WARNING, ERROR, SUCCESS,     │        │
│  │    REMINDER                                   │        │
│  │  - Unread count badge in UI                  │        │
│  │  - Mark as read / mark all read              │        │
│  │  - Paginated history (20 per page)           │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Channel 2: REAL-TIME (Socket.IO)            │        │
│  │                                               │        │
│  │  - Instant push on new notification          │        │
│  │  - Chat message delivery                     │        │
│  │  - User presence tracking                    │        │
│  │  - Room-based isolation                      │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Channel 3: EMAIL (Nodemailer)               │        │
│  │                                               │        │
│  │  - OTP verification codes                    │        │
│  │  - Password reset links                      │        │
│  │  - Critical alerts                           │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │ Channel 4: SMS / WhatsApp (Twilio)          │        │
│  │                                               │        │
│  │  - OTP delivery                              │        │
│  │  - Urgent weather alerts                     │        │
│  │  - Crop calendar reminders                   │        │
│  │  - Market price alerts                       │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  POST-MVP: Push notifications (FCM), WhatsApp          │
│  Business API, regional language templates              │
└─────────────────────────────────────────────────────────┘
```

---

## Architecture Decisions

### Monolith vs Microservices: MONOLITH

| Factor              | Monolith (Chosen)                    | Microservices               |
|---------------------|--------------------------------------|-----------------------------|
| Team size (2-3)     | ✅ Perfect                           | ❌ Overkill                 |
| Dev speed           | ✅ Fast iteration                    | ❌ Inter-service overhead   |
| Deployment          | ✅ Single container                  | ❌ K8s/Docker Compose       |
| Debugging           | ✅ Single log stream (Winston)       | ❌ Distributed tracing      |
| Cost                | ✅ $5-10/mo                          | ❌ $50-100/mo minimum       |
| Real-time           | ✅ Socket.IO embedded in Express     | ❌ Separate WS service      |
| When to split       | When you hit 10K+ users or 5+ devs  | —                           |

### Database: SQLite → PostgreSQL

| Why SQLite (Dev)                       | Why PostgreSQL (Prod)                    |
|----------------------------------------|------------------------------------------|
| Zero-config local setup                | ACID for concurrent writes               |
| File-based, no server needed           | Full-text search built-in                |
| Prisma ORM abstracts the difference    | JSON columns for flexible data           |
| Fast for single-user development       | Supabase provides managed free tier      |
| Perfect for demos and prototyping      | Scalable to 100K+ users                 |

### Hybrid Architecture: WHY

| Data Type                      | Where it Lives          | Why                                    |
|--------------------------------|-------------------------|----------------------------------------|
| Identity, sessions, profiles   | Supabase (PostgreSQL)   | Managed auth, RLS, real-time sync      |
| Business data (docs, chat, etc)| Express + SQLite/PG     | Custom logic, RBAC enforcement         |
| Agricultural knowledge         | Frontend (src/data/*)   | Instant lookups, no API latency        |
| AI/Voice                       | Sarvam AI API           | No GPU needed, pay-per-use             |

### AI Model Integration: API-Based, Not Self-Hosted

```
┌─────────────────────────────────────────────────────┐
│  AI MODEL INTEGRATION STRATEGY                       │
│                                                       │
│  MVP: Sarvam AI API (Indian LLM)                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ Why Sarvam AI:                               │    │
│  │ - Native Indian language support (12+ langs) │    │
│  │ - Optimized for Indian agriculture domain    │    │
│  │ - Speech-to-text + text-to-speech included   │    │
│  │ - No GPU needed (API call)                   │    │
│  │ - Code-mixing support (Hinglish, etc.)       │    │
│  │ - Fast response (< 3 sec)                    │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Integration Pattern:                                │
│  ┌─────────────────────────────────────────────┐    │
│  │                                               │    │
│  │  Sarvam API Client (backend/src/services/)   │    │
│  │                                               │    │
│  │    Chat:  sarvam-30b model                   │    │
│  │      - Temperature: 0.3                      │    │
│  │      - Max tokens: 700                       │    │
│  │      - Role-aware system prompts             │    │
│  │      - Context: last 12 messages             │    │
│  │                                               │    │
│  │    STT:   saaras:v3 model                    │    │
│  │      - Modes: transcribe, translate,         │    │
│  │        transliterate, code-mix               │    │
│  │      - Audio formats: wav, mp3, ogg          │    │
│  │                                               │    │
│  │    TTS:   bulbul:v3 model                    │    │
│  │      - Adjustable speaker & pace             │    │
│  │      - Base64 audio output                   │    │
│  │                                               │    │
│  │  Cost per user interaction: ~$0.001          │    │
│  │  1000 users × 10 interactions = ~$10         │    │
│  │                                               │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Fallback Strategy:                                  │
│  1. Primary: Sarvam AI (sarvam-30b)                 │
│  2. Fallback: OpenAI GPT-4o-mini                    │
│  3. Emergency: Curated dataset responses             │
│     (60+ crops, 50+ diseases — always available)     │
│                                                       │
│  POST-MVP:                                           │
│  - Fine-tune open-source model on agri Q&A data     │
│  - Self-host for cost reduction at scale             │
│  - Satellite image analysis (NDVI, crop health)      │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Farmer Advisory Flow

```
Farmer                    Frontend           Backend          Sarvam AI         DB
   │                         │                  │                 │              │
   │── Open Advisory ───────►│                  │                 │              │
   │                         │── Load crop data─┤                 │              │
   │                         │  (from src/data) │                 │              │
   │◄── Show crop options ───│                  │                 │              │
   │                         │                  │                 │              │
   │── Select crop + ask ───►│                  │                 │              │
   │                         │── POST /ai/      │                 │              │
   │                         │   recommend ─────►│                 │              │
   │                         │                  │── Generate ─────►│              │
   │                         │                  │◄── AI response──│              │
   │                         │                  │── Store rec ──────────────────►│
   │                         │◄── Recommendation│                 │              │
   │◄── Show advice ────────│                  │                 │              │
   │                         │                  │                 │              │
   │── Voice question ──────►│                  │                 │              │
   │   (audio recording)     │── POST /chat/    │                 │              │
   │                         │   voice/         │                 │              │
   │                         │   transcribe ────►│                 │              │
   │                         │                  │── STT ──────────►│              │
   │                         │                  │◄── Text ────────│              │
   │                         │                  │── Chat ─────────►│              │
   │                         │                  │◄── Response ────│              │
   │                         │                  │── TTS ──────────►│              │
   │                         │                  │◄── Audio ───────│              │
   │                         │                  │── Store ──────────────────────►│
   │                         │◄── Audio + text──│                 │              │
   │◄── Play response ──────│                  │                 │              │
```

### Expert Consultation Flow

```
Farmer                    Frontend           Backend          Socket.IO         DB
   │                         │                  │                 │              │
   │── Open Chat ───────────►│                  │                 │              │
   │                         │── WS connect ────────────────────►│              │
   │                         │  (JWT auth)      │                 │              │
   │                         │◄── Connected ─────────────────────│              │
   │                         │── Join room ─────────────────────►│              │
   │                         │                  │                 │              │
   │── Send message ────────►│                  │                 │              │
   │                         │── POST /chat/    │                 │              │
   │                         │   message ───────►│                 │              │
   │                         │                  │── Store ──────────────────────►│
   │                         │                  │── Emit to room──►│              │
   │                         │◄── Message ──────│◄────────────────│              │
   │◄── Show message ───────│                  │                 │              │
   │                         │                  │                 │              │
Expert                                                                          │
   │── Receive notification ◄─────────────────────────────────────│              │
   │── Reply ───────────────►│                  │                 │              │
   │                         │── POST /chat/    │                 │              │
   │                         │   message ───────►│                 │              │
   │                         │                  │── Store ──────────────────────►│
   │                         │                  │── Emit to room──►│              │
Farmer                                                                          │
   │◄── Receive reply ──────◄─────────────────────────────────────│              │
```

### Document Verification Flow

```
Farmer                    Frontend           Backend          Admin             DB
   │                         │                  │                │               │
   │── Upload document ─────►│                  │                │               │
   │   (ID proof / land)     │── POST /documents│                │               │
   │                         │   /upload ───────►│                │               │
   │                         │                  │── Validate ────│               │
   │                         │                  │   (type, size) │               │
   │                         │                  │── Store file ──│               │
   │                         │                  │── Save meta ─────────────────►│
   │                         │                  │── Notify admin─►│               │
   │                         │◄── Uploaded ─────│                │               │
   │◄── Confirmation ───────│                  │                │               │
   │                         │                  │                │               │
   │                         │                  │                │               │
   │                         │                  │   Admin reviews│               │
   │                         │                  │◄── Verify ─────│               │
   │                         │                  │── Update ────────────────────►│
   │                         │                  │── Notify farmer│               │
   │◄── Verification status ◄──────────────────│                │               │
```

---

## Rate Limiting Strategy

```
┌─────────────────────────────────────────────────────┐
│              RATE LIMITING (express-rate-limit)       │
│                                                       │
│  Tier 1: GENERAL API                                 │
│    Window: 15 minutes                                │
│    Max: 100 requests per IP                          │
│    Applies to: all /api/* routes                     │
│                                                       │
│  Tier 2: AUTH ENDPOINTS                              │
│    Window: 15 minutes                                │
│    Max: 20 requests per IP                           │
│    Applies to: /api/auth/signup, /api/auth/login     │
│    Purpose: Prevent brute force attacks              │
│                                                       │
│  Tier 3: AI / LLM ENDPOINTS                         │
│    Window: 15 minutes                                │
│    Max: 40 requests per IP                           │
│    Applies to: /api/ai/*, /api/chat/complete         │
│    Purpose: Control API costs                        │
│                                                       │
│  Tier 4: CHAT MESSAGES                               │
│    Window: 5 minutes                                 │
│    Max: 60 requests per user                         │
│    Applies to: /api/chat/message                     │
│    Purpose: Prevent spam                             │
│                                                       │
│  Response on limit: 429 Too Many Requests            │
│  Headers: X-RateLimit-Limit, X-RateLimit-Remaining   │
└─────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                  DEPLOYMENT (MVP)                      │
│                                                        │
│  Option A: Vercel + Railway (Recommended)             │
│  ┌──────────────────────────────────────────────┐    │
│  │  Vercel: React SPA frontend (free tier)       │    │
│  │    - Auto-deploy from GitHub                  │    │
│  │    - SPA rewrites via vercel.json             │    │
│  │    - Edge CDN for static assets               │    │
│  │                                                │    │
│  │  Railway: Express backend ($5/mo)             │    │
│  │    - Node.js container                        │    │
│  │    - Socket.IO + REST API                     │    │
│  │    - SQLite (dev) / PostgreSQL (prod)         │    │
│  │    - File uploads (local storage)             │    │
│  │                                                │    │
│  │  Supabase: Auth + PostgreSQL (free tier)      │    │
│  │    - Managed authentication                   │    │
│  │    - Profile/role tables                      │    │
│  │    - Real-time subscriptions                  │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  Option B: Single Railway Container                   │
│  ┌──────────────────────────────────────────────┐    │
│  │  Railway: Vite build + Express (single proc)  │    │
│  │    - Express serves static React build        │    │
│  │    - API on same origin (no CORS issues)      │    │
│  │    - PostgreSQL add-on (~$5/mo)               │    │
│  │    - Total: ~$10/mo all-in                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  External Services:                                   │
│  ┌──────────────────────────────────────────────┐    │
│  │  Sarvam AI API     → Pay-per-use (voice+LLM) │    │
│  │  Twilio            → Pay-per-use (SMS)        │    │
│  │  Nodemailer/SMTP   → Free tier available      │    │
│  │  OpenWeatherMap    → Free tier (1000 calls/d) │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  Total: ₹400-1200/mo ($5-15/mo)                     │
│                                                        │
│  POST-MVP: AWS/GCP with Docker, CI/CD pipeline,     │
│  managed PostgreSQL, S3 for file storage,            │
│  CloudFront CDN, auto-scaling                        │
└──────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│              SECURITY LAYERS                         │
│                                                       │
│  Layer 1: TRANSPORT                                  │
│    - HTTPS everywhere (Vercel + Railway enforce)    │
│    - Helmet.js security headers                     │
│    - CORS whitelist (FRONTEND_URL only)             │
│                                                       │
│  Layer 2: AUTHENTICATION                             │
│    - bcrypt password hashing (12 rounds)            │
│    - JWT tokens with expiry                         │
│    - OTP-based 2FA for Admin/Expert                 │
│    - Supabase RLS policies                          │
│                                                       │
│  Layer 3: AUTHORIZATION                              │
│    - Role-based middleware (authorize([roles]))      │
│    - Resource ownership checks                      │
│    - Socket.IO room isolation                       │
│                                                       │
│  Layer 4: INPUT VALIDATION                           │
│    - express-validator on all endpoints             │
│    - Zod schemas on frontend                        │
│    - File type + size validation (Multer)           │
│    - SQL injection prevention (Prisma ORM)          │
│                                                       │
│  Layer 5: RATE LIMITING                              │
│    - Per-IP rate limits (4 tiers)                   │
│    - Auth endpoint hardening (20 req/15min)         │
│    - AI endpoint cost control                       │
│                                                       │
│  Layer 6: ERROR HANDLING                             │
│    - Global error boundary (React)                  │
│    - Express error middleware (no stack traces       │
│      in production)                                  │
│    - Winston structured logging                     │
│    - Graceful degradation (Sarvam → fallback)       │
│                                                       │
│  POST-MVP: WAF, DDoS protection, audit logs,       │
│  OWASP ZAP scanning, penetration testing            │
└─────────────────────────────────────────────────────┘
```

---

## Environment Configuration

```
┌─────────────────────────────────────────────────────┐
│           ENVIRONMENT VARIABLES                      │
│                                                       │
│  FRONTEND (.env)                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ VITE_SUPABASE_URL          → Supabase proj  │    │
│  │ VITE_SUPABASE_PUBLISHABLE_KEY → Anon key    │    │
│  │ VITE_API_BASE_URL          → Backend URL    │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  BACKEND (.env)                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ NODE_ENV          → development/production   │    │
│  │ PORT              → 3001                     │    │
│  │ DATABASE_URL      → file:./dev.db (SQLite)   │    │
│  │                      or postgresql://...      │    │
│  │ JWT_SECRET        → signing key              │    │
│  │ SARVAM_API_KEY    → Sarvam AI credentials    │    │
│  │ SARVAM_API_BASE_URL → https://api.sarvam.ai │    │
│  │ SARVAM_CHAT_MODEL → sarvam-30b              │    │
│  │ SARVAM_STT_MODEL  → saaras:v3               │    │
│  │ SARVAM_TTS_MODEL  → bulbul:v3               │    │
│  │ TWILIO_SID        → Twilio account SID       │    │
│  │ TWILIO_AUTH_TOKEN  → Twilio auth token       │    │
│  │ SMTP_HOST/PORT/USER/PASS → Email config      │    │
│  │ FRONTEND_URL      → CORS origin              │    │
│  │ RATE_LIMIT_WINDOW_MS → 900000 (15 min)      │    │
│  │ RATE_LIMIT_MAX_REQUESTS → 100               │    │
│  │ MAX_FILE_SIZE     → 10485760 (10MB)          │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```
