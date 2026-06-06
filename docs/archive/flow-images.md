# Flow Images

## Purpose

This page contains presentation-ready Mermaid diagrams for the main product, data, and technical flows of Farm Intellect. These are the strongest "flow images" to show in a demo deck or architecture review.

## 1. Full app navigation flow

```mermaid
flowchart TB
    Start[User opens app] --> Landing[Landing Page]
    Landing --> Login[Login / Signup]
    Login --> Decide{Role}
    Decide --> Farmer[Farmer Dashboard]
    Decide --> Merchant[Merchant Dashboard]
    Decide --> Expert[Expert Dashboard]
    Decide --> Admin[Admin Dashboard]
```

## 2. Authentication flow image

```mermaid
sequenceDiagram
    participant User
    participant UI as Login UI
    participant Supabase as Supabase Auth
    participant Context as AuthContext
    participant Route as ProtectedRoute
    participant Backend as Express API

    User->>UI: enter credentials
    UI->>Supabase: sign in
    Supabase-->>UI: session / token
    UI->>Context: store session state
    Context->>Route: authorize protected route render
    UI->>Backend: call protected API with Bearer token
    Backend-->>UI: secured response
```

## 3. Farmer advisory journey image

```mermaid
flowchart LR
    Farmer[Farmer Dashboard]
    Farmer --> Weather[Weather Insights]
    Farmer --> Crops[Crop Recommendation]
    Farmer --> Advisory[AI Advisory]
    Farmer --> Scanner[Crop Scanner]
    Farmer --> Calendar[Crop Calendar]
    Farmer --> Market[Mandi / Merchant Insights]
    Farmer --> Docs[Documents]
    Farmer --> Chat[Chat / Forum]
```

## 4. Crop recommendation flow image

```mermaid
flowchart LR
    Input[Farmer inputs soil / climate values]
    Input --> UI[Recommendation UI]
    UI --> Data[cropRecommendations.ts]
    UI --> Soil[soilHealth.ts]
    Data --> Engine[Recommendation Logic]
    Soil --> Engine
    Engine --> Output[Suggested crops + confidence + advice]
```

## 5. Crop scanner flow image

```mermaid
flowchart LR
    Upload[User uploads crop image / symptom context]
    Upload --> ScannerUI[Crop Scanner Page]
    ScannerUI --> Disease[cropDiseases.ts]
    ScannerUI --> Pest[pestData.ts]
    Disease --> Diagnose[Diagnosis Mapping]
    Pest --> Diagnose
    Diagnose --> Result[Symptoms + likely issue + treatment + prevention]
```

## 6. Chatbot knowledge flow image

```mermaid
flowchart LR
    Question[Farmer asks question]
    Question --> ChatUI[SmartChatbot]
    ChatUI --> KCC[kisanCallCenter.ts]
    ChatUI --> Disease[cropDiseases.ts]
    ChatUI --> Calendar[cropCalendar.ts]
    ChatUI --> Compose[Response Composer]
    Compose --> Answer[Guided answer with advisory context]
```

## 7. Analytics flow image

```mermaid
flowchart LR
    AnalyticsPage[Analytics Page]
    AnalyticsPage --> Production[cropProduction.ts]
    AnalyticsPage --> Prices[mandiPrices.ts]
    Production --> Charts[Charts / KPIs / Trends]
    Prices --> Charts
    Charts --> Insights[Decision-support insights]
```

## 8. Field map / satellite flow image

```mermaid
flowchart LR
    FieldMapPage[Field Map UI]
    FieldMapPage --> Satellite[satelliteData.ts]
    Satellite --> NDVI[NDVI / Vegetation Stage Mapping]
    NDVI --> Guidance[Crop health interpretation + recommendations]
```

## 9. Backend request flow image

```mermaid
flowchart LR
    Browser[Frontend Request]
    Browser --> Helmet[Security Middleware]
    Helmet --> RateLimit[Rate Limiter]
    RateLimit --> Auth[JWT Auth]
    Auth --> RBAC[Role Authorization]
    RBAC --> Route[Route Handler]
    Route --> Prisma[Prisma ORM]
    Prisma --> DB[(Database)]
    DB --> Response[JSON Response]
```

## 10. Realtime messaging flow image

```mermaid
sequenceDiagram
    participant Sender
    participant Socket as Socket.IO
    participant JWT as JWT Verify
    participant Room as User Room
    participant Receiver

    Sender->>Socket: connect(auth.token)
    Socket->>JWT: validate token
    JWT-->>Socket: socket.userId
    Sender->>Socket: join-user-room
    Sender->>Socket: send-message(recipientId, senderId, payload)
    Socket->>Socket: verify senderId matches socket.userId
    Socket->>Room: emit to user-recipientId
    Room-->>Receiver: new-message
```

## 11. Document verification flow image

```mermaid
flowchart LR
    User[Farmer / Merchant / User] --> Upload[Upload document]
    Upload --> Backend[Documents API]
    Backend --> Store[Store metadata / file]
    Store --> Pending[Pending verification queue]
    Pending --> Reviewer[Expert or Admin]
    Reviewer --> Decision{Verify or Reject}
    Decision --> Notify[Send notification]
```

## 12. Admin control flow image

```mermaid
flowchart LR
    Admin[Admin Dashboard]
    Admin --> Users[User Management]
    Admin --> Analytics[System Analytics]
    Admin --> Settings[System Settings]
    Admin --> Notifications[Broadcast / Alerts]
    Admin --> Moderation[Document / Platform Oversight]
```

## Best images to put in slides

If you only use 4 diagrams in a presentation, use these:

1. Full app navigation flow
2. Layered architecture from `architecture.md`
3. Crop scanner flow image
4. Backend request flow image
