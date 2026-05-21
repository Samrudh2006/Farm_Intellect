# Voice Agent - System Architecture

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         EnhancedVoiceAgent Component                      │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ • Language Selection (22 languages)                │  │   │
│  │  │ • Start/Stop Recording Button                      │  │   │
│  │  │ • Real-time Recording Status                       │  │   │
│  │  │ • Transcription Display                            │  │   │
│  │  │ • AI Response Display                              │  │   │
│  │  │ • Playback Controls                                │  │   │
│  │  │ • Conversation History                             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                          ↓↑                                 │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │      MediaRecorder API                             │  │   │
│  │  │  • Captures audio from microphone                  │  │   │
│  │  │  • Converts to WebM format                         │  │   │
│  │  │  • Converts to Base64                              │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                          ↓                                 │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │      VoiceService Client                           │  │   │
│  │  │  • API wrapper for backend calls                   │  │   │
│  │  │  • Audio blob conversion                           │  │   │
│  │  │  • Playback management                             │  │   │
│  │  │  • History fetching                                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                          ↓                                 │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │      useVoiceAgent Hook                            │  │   │
│  │  │  • Orchestrates entire flow                        │  │   │
│  │  │  • Manages component state                         │  │   │
│  │  │  • Handles errors & edge cases                     │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                         Network Call
                    (POST /api/voice/process)
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        voice.js Routes                                   │   │
│  │  • POST /voice/process (audio → response)              │   │
│  │  • POST /voice/process-stream (chunked audio)           │   │
│  │  • GET /voice/history (conversation history)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Step 1: Sarvam STT Service                            │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Audio Buffer                                       │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Call transcribeSarvamAudio()                       │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Sarvam API (saaras:v3)                            │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Text Transcription (22 languages)                 │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Step 2: Intent Detection                             │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Transcription                                      │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ detectIntent() function                            │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Match against keyword categories:                 │ │   │
│  │  │  • crop_recommendation                            │ │   │
│  │  │  • disease_diagnosis                              │ │   │
│  │  │  • soil_health                                    │ │   │
│  │  │  • market_prices                                  │ │   │
│  │  │  • irrigation                                     │ │   │
│  │  │  • fertilizer                                     │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Intent Type (+ confidence)                         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Step 3: Route to Agricultural AI                     │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Intent → Routing Logic                             │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Switch on intent:                                  │ │   │
│  │  │  → getCropRecommendation()                         │ │   │
│  │  │  → getDiseaseDiagnosis()                           │ │   │
│  │  │  → getSoilHealth()                                 │ │   │
│  │  │  → getMarketPrices()                               │ │   │
│  │  │  → getIrrigationAdvice()                           │ │   │
│  │  │  → getFertilizerAdvice()                           │ │   │
│  │  │  → getGeneralAgriculturalAdvice()                  │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Call Sarvam Chat (sarvam-30b)                      │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ AI-Generated Response                              │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Step 4: Agricultural Intelligence Enrichment         │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ AI Response                                        │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ enrichResponse() function                          │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Get User Farm Context:                            │ │   │
│  │  │  • Location                                       │ │   │
│  │  │  • Farm Size                                      │ │   │
│  │  │  • Current Season                                 │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Append Regional Data:                             │ │   │
│  │  │  • Seasonal tips                                  │ │   │
│  │  │  • Disease alerts                                 │ │   │
│  │  │  • Market strategies                              │ │   │
│  │  │  • Soil management                                │ │   │
│  │  │  • Weather guidance                               │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Enriched Response                                  │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Step 5: Sarvam TTS Service                           │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Response Text                                      │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Call synthesizeSarvamSpeech()                      │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Sarvam API (bulbul:v3)                            │ │   │
│  │  │ ↓                                                  │ │   │
│  │  │ Audio Base64 (WAV format)                          │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Step 6: Database Storage                             │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Save to voice_interactions table:                  │ │   │
│  │  │  • user_id                                        │ │   │
│  │  │  • language                                       │ │   │
│  │  │  • transcription                                  │ │   │
│  │  │  • response                                       │ │   │
│  │  │  • audio_base64                                   │ │   │
│  │  │  • intent                                         │ │   │
│  │  │  • status                                         │ │   │
│  │  │  • created_at                                     │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Step 7: Return Response                              │   │
│  │  {                                                       │   │
│  │    "success": true,                                      │   │
│  │    "transcription": "What crops...",                     │   │
│  │    "response": "Based on your...",                       │   │
│  │    "audioBase64": "AAAAB3NzaUIn8...",                   │   │
│  │    "language": "en-IN"                                   │   │
│  │  }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                        Network Response
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Response Handling                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Display Transcription                                        │
│  2. Display AI Response                                          │
│  3. Play Audio Automatically                                     │
│  4. Add to Conversation History                                  │
│  5. Show Success Message                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 Data Flow

```
User Voice Input
     ↓
[Recording] 0-30 seconds max
     ↓
[Encode] Convert to WebM audio
     ↓
[Send] POST to /api/voice/process
     ↓
[STT] Sarvam converts audio to text
     ↓
[Intent] Classify question type
     ↓
[Route] Send to appropriate AI endpoint
     ↓
[Generate] Sarvam creates response
     ↓
[Enrich] Add regional/contextual data
     ↓
[TTS] Sarvam converts response to audio
     ↓
[Store] Save to database
     ↓
[Return] Send response + audio to frontend
     ↓
[Display] Show text response
     ↓
[Playback] Auto-play audio response
```

## 🔄 Component Interaction

```
Frontend Components:
┌─────────────────────────────────────────┐
│      EnhancedVoiceAgent.tsx             │
│  (Main UI Component)                    │
└─────────────────────────┬───────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
    ┌───▼────────────┐          ┌──────────▼──────┐
    │ useVoiceAgent  │          │  voiceService   │
    │ (React Hook)   │          │  (API Client)   │
    └───┬────────────┘          └──────────┬──────┘
        │                                  │
        └──────────────┬───────────────────┘
                       │
                  HTTP Request
                       │
        ┌──────────────┴───────────────────┐
        │                                  │
    ┌───▼──────────────────┐      ┌────────▼─────────┐
    │   Backend Voice      │      │   Sarvam AI      │
    │   Routes            │      │   Services       │
    │                      │      │                   │
    │ • STT Processing    │◄────►│ • Speech-to-Text  │
    │ • Intent Routing    │◄────►│ • Text-to-Speech  │
    │ • AI Response Gen   │◄────►│ • Chat Model      │
    │ • Data Enrichment   │      │                   │
    │ • DB Storage        │      │                   │
    └───────────────────────┘      └───────────────────┘
```

## 🎯 Intent Routing Map

```
User Question
      ↓
Intent Classifier
      ├─► "crop recommendation" ────► getCropRecommendation()
      ├─► "disease diagnosis" ────► getDiseaseDiagnosis()
      ├─► "pest management" ────► getPestManagement()
      ├─► "soil health" ────► getSoilHealth()
      ├─► "market prices" ────► getMarketPrices()
      ├─► "irrigation" ────► getIrrigationAdvice()
      ├─► "fertilizer" ────► getFertilizerAdvice()
      └─► (default) ────► getGeneralAgriculturalAdvice()
           ↓
      Sarvam Chat API
           ↓
      AI Response
           ↓
      Agricultural Intelligence Enrichment
           ↓
      Sarvam TTS
           ↓
      Audio Response
```

## 📊 Performance Path

```
┌─────────────────────────────────────────────────────────────┐
│                    Total Latency: 2-5 seconds               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Stops Speaking                                         │
│  │                                                           │
│  ├─► [0-1s] Upload audio buffer                            │
│  │                                                           │
│  ├─► [1-2s] Sarvam STT Processing                           │
│  │           (Audio → Text)                                  │
│  │                                                           │
│  ├─► [0.1s] Intent Detection                               │
│  │           (Keyword matching)                              │
│  │                                                           │
│  ├─► [0.5-1s] AI Response Generation                        │
│  │             (Sarvam Chat API)                            │
│  │                                                           │
│  ├─► [0.2s] Agricultural Enrichment                         │
│  │           (DB queries + data append)                      │
│  │                                                           │
│  ├─► [0.5-1s] Sarvam TTS Processing                         │
│  │             (Text → Audio)                                │
│  │                                                           │
│  ├─► [0.1s] Send Response to Frontend                       │
│  │                                                           │
│  └─► Response Displayed & Audio Playing                     │
│                                                              │
│  Total: 2.4-5.1 seconds (typical: 3-4 seconds)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🛡️ Security Flow

```
Request
  ↓
[Verify JWT Token]
  ↓ (Invalid)
[Return 401 Unauthorized]
  ↓ (Valid)
[Check Rate Limit]
  ↓ (Exceeded)
[Return 429 Too Many Requests]
  ↓ (OK)
[Validate Input Audio]
  ↓ (Invalid)
[Return 400 Bad Request]
  ↓ (Valid)
[Process Request]
  ↓
[Sanitize Text]
  ↓
[Authenticate Sarvam]
  ↓ (Success)
[Return Response]
  ↓ (Failure)
[Return Error Message]
```

## 🗄️ Database Schema

```
voice_interactions
├── id (PRIMARY KEY)
├── user_id (FOREIGN KEY → users)
├── language (VARCHAR 10)
├── transcription (TEXT)
├── response (TEXT)
├── audio_base64 (LONGTEXT)
├── intent (VARCHAR 50)
├── confidence (DECIMAL)
├── status (VARCHAR 20)
├── processing_time_ms (INTEGER)
├── error_message (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

voice_preferences
├── id (PRIMARY KEY)
├── user_id (FOREIGN KEY → users)
├── preferred_language (VARCHAR 10)
├── auto_play_response (BOOLEAN)
├── voice_speed (DECIMAL)
├── recording_duration_limit_ms (INTEGER)
├── enable_history (BOOLEAN)
├── max_history_items (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

voice_intent_logs
├── id (PRIMARY KEY)
├── interaction_id (FOREIGN KEY → voice_interactions)
├── intent_type (VARCHAR 50)
├── intent_confidence (DECIMAL)
├── extracted_entities (JSON)
├── routing_response (TEXT)
└── created_at (TIMESTAMP)
```

## ✨ This is the complete architecture powering your voice agent!
