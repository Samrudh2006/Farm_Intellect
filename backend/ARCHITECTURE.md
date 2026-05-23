# Farm Intellect Architecture

## Overview

Farm Intellect is a fullstack agricultural intelligence platform combining React frontend with Node/Express backend. This document clarifies the architectural decisions and when to use each component.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (Vite)                                       │
│  ├── Routes: Login, Dashboard, FieldMap, Calendar, etc.     │
│  ├── State: Supabase Auth, React Query (TanStack)           │
│  └── Offline: Service Worker + LocalStorage sync            │
└─────────────────────────────────────────────────────────────┘
           ↓                              ↓
    ┌──────────────────┐        ┌──────────────────┐
    │ Supabase Client  │        │ Express Backend  │
    │  (Direct RLS)    │        │    (Logic/APIs)  │
    │                  │        │                  │
    │ ✅ OK:           │        │ ✅ OK:           │
    │ - Simple CRUD    │        │ - Auth (SMS/OTP) │
    │ - Real-time subs │        │ - Business logic │
    │ - Subscriptions  │        │ - Third-party    │
    │                  │        │   APIs           │
    │ ❌ NOT OK:       │        │ - File uploads   │
    │ - Complex queries│        │ - Webhooks       │
    │ - Auth (use API) │        │ - Rate limiting  │
    └──────────────────┘        └──────────────────┘
           ↓                              ↓
    ┌──────────────────┐        ┌──────────────────┐
    │    Supabase      │        │  External APIs   │
    │   (PostgreSQL)   │        │  (SMS, Weather)  │
    │   - Auth         │        │  - Twilio        │
    │   - Data (RLS)   │        │  - OpenWeather   │
    │   - Real-time    │        │  - Market Data   │
    └──────────────────┘        └──────────────────┘
```

---

## Component Responsibilities

### Frontend (React + Vite)

**Primary Role**: User interface, client-side routing, form management, visualization

**Managed Data**:
- User state (Supabase Auth session)
- Page state (forms, filters, modals)
- UI cache (React Query)
- Offline queue (Service Worker + IndexedDB)

**Technologies**:
- **Routing**: React Router v6 (lazy-loaded routes)
- **State**: React Query (TanStack) for server state
- **Forms**: React Hook Form + Zod validation
- **Auth**: Supabase Auth (email/SMS/social)
- **UI**: Radix UI + Tailwind CSS
- **Visualization**: Recharts (analytics), Fabric.js (FieldMap), Framer Motion (animations)

**API Communication**:
```typescript
// ✅ Direct Supabase (safe, uses RLS)
const data = await supabase
  .from('farms')
  .select('*')
  .match({ user_id: userId });

// ✅ Backend API (for complex operations)
const result = await fetch('/api/crops/recommend', {
  method: 'POST',
  body: JSON.stringify(farmData),
});

// ❌ NEVER expose API keys in frontend
// ❌ NEVER make calls that bypass RLS
```

---

### Backend (Express + Node)

**Primary Role**: Business logic, third-party integrations, authentication flow, secure operations

**Responsibilities**:
1. **Authentication**: SMS OTP, email verification, session management
2. **Business Logic**: Crop recommendations, price analysis, field calculations
3. **Third-party Integrations**: Weather APIs, SMS providers, market data
4. **File Operations**: Image processing, PDF generation, file uploads
5. **Rate Limiting**: Prevent abuse of expensive operations
6. **Webhooks**: Handle incoming SMS, payments, external events

**Routes** (Express):
```typescript
// Auth flows
POST /api/auth/register       → SMS OTP send
POST /api/auth/verify-otp     → Create session
POST /api/auth/logout         → Clear session

// Business logic
POST /api/crops/recommend     → AI recommendations
GET  /api/market/prices       → Mandi rates
GET  /api/weather/forecast    → Weather for farm
POST /api/field/analyze       → Image analysis

// Admin operations
POST /api/admin/sms/broadcast → Send bulk SMS
GET  /api/admin/analytics     → Usage metrics
POST /api/admin/users/import  → Bulk user import

// Webhooks
POST /webhooks/sms/inbound    → Incoming SMS
POST /webhooks/payment        → Payment confirmations
```

**Technologies**:
- **Framework**: Express.js v4
- **Database**: Supabase PostgreSQL (connected directly)
- **Auth**: Supabase Admin SDK (server-side)
- **Tasks**: Node.js async/await, job queues for long operations
- **Monitoring**: Sentry, structured logging

**Example Route** (Pattern):
```typescript
// backend/routes/crops.ts
import { express } from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';
import * as AI from '../services/ai-recommendations';

router.post('/recommend', authMiddleware, async (req, res) => {
  try {
    const { farmId, season } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Verify user owns this farm (explicit check, don't trust client)
    const { data: farm } = await supabaseAdmin
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .eq('user_id', userId)
      .single();
    
    if (!farm) {
      return res.status(403).json({ error: 'Farm not found' });
    }
    
    // Call business logic
    const recommendations = await AI.getCropRecommendations(farm, season);
    
    // Store in Supabase for client to fetch
    await supabaseAdmin
      .from('recommendations')
      .insert({
        farm_id: farmId,
        data: recommendations,
        created_at: new Date(),
      });
    
    res.json({ success: true, recommendations });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Data Flow Patterns

### Pattern 1: Simple CRUD (Supabase Direct)
Best for: Reading public data, user's own data with RLS

```typescript
// Frontend
const { data: farms } = await supabase
  .from('farms')
  .select('*')
  .eq('user_id', userId); // RLS enforces this anyway
```

**Advantages**:
- Minimal latency (direct DB connection)
- Realtime subscriptions work automatically
- No server processing needed

**When to use**:
- Reading user-specific data (RLS protected)
- Simple list/detail pages
- Realtime updates needed

---

### Pattern 2: Complex Logic (Backend API)
Best for: Calculations, AI, external integrations, rate-limited operations

```typescript
// Frontend
const recommendations = await fetch('/api/crops/recommend', {
  method: 'POST',
  body: JSON.stringify({ farmId, soilType, budget }),
  headers: { 'Content-Type': 'application/json' },
});

// Backend
async function getCropRecommendations(farm, soil, budget) {
  const weather = await getWeatherData(farm.location);
  const marketPrices = await getMarketPrices();
  const recommendations = await AI.model.predict({
    soil, weather, budget, marketPrices
  });
  return recommendations;
}
```

**Advantages**:
- Complex calculations centralized
- Rate limiting possible
- External APIs kept private

**When to use**:
- AI/ML predictions
- Multi-step operations
- Rate-limited features (SMS, heavy compute)
- Third-party API calls

---

### Pattern 3: Real-time Collaboration (Supabase Realtime)
Best for: Live field data, multi-user updates

```typescript
// Frontend
supabase
  .channel('farm_updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'field_sensors' },
    (payload) => {
      setFieldData(payload.new);
    }
  )
  .subscribe();
```

**Advantages**:
- Zero-latency live updates
- Built-in for PostgreSQL
- Scales to many concurrent users

**When to use**:
- Real-time sensor data
- Live collaboration (multiple users editing)
- Notifications/events

---

## Authentication Flow

### SMS OTP Flow (Current Implementation)
```
1. Frontend → Backend: POST /api/auth/register { phone }
   - Backend: Generate OTP, send via Twilio
   
2. Frontend: User enters OTP
   
3. Frontend → Backend: POST /api/auth/verify-otp { phone, otp }
   - Backend: Verify OTP, create Supabase session
   - Backend: Return JWT session token
   
4. Frontend: Save session, authenticate with Supabase
   - Future requests include auth header
   - Supabase RLS enforces data isolation
```

**Security Model**:
- ✅ OTP validated server-side
- ✅ Session tokens signed server-side
- ✅ All sensitive data in Supabase (encrypted)
- ✅ Frontend tokens expire automatically
- ✅ RLS prevents data leakage

---

## Row-Level Security (RLS)

Supabase enforces data access at database level. Example policies:

```sql
-- Users can only see their own farms
CREATE POLICY "Users see own farms" ON public.farms
  USING (auth.uid() = user_id);

-- Users can only modify their own data
CREATE POLICY "Users modify own farms" ON public.farms
  USING (auth.uid() = user_id);

-- Admin can see all data
CREATE POLICY "Admins see all farms" ON public.farms
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
```

**Benefits**:
- Data isolation enforced at DB level (not just app level)
- Even if frontend or backend is compromised, RLS prevents data leakage
- Scales to 1000s of users safely

---

## API Security

### Request Pattern
```typescript
// ✅ SECURE: Use Supabase auth token
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
  },
});

// ❌ INSECURE: Never send API keys in frontend
// ❌ INSECURE: Never expose database credentials
// ❌ INSECURE: Never trust user_id from frontend alone
```

### Backend Validation
```typescript
// ✅ Always verify user identity server-side
const userId = req.user.id; // From auth middleware
const data = await supabase
  .from('farms')
  .select('*')
  .eq('id', farmId)
  .eq('user_id', userId) // Explicit check
  .single();

// ✅ Validate inputs with Zod
const schema = z.object({
  farmId: z.string().uuid(),
  season: z.enum(['kharif', 'rabi', 'summer']),
});
const { farmId, season } = schema.parse(req.body);

// ✅ Rate limit expensive operations
await rateLimiter.limit(`crop-recommend:${userId}`);
```

---

## Offline Functionality

### Service Worker Strategy
```
Network-first (APIs):
  Try: Fetch from server
  Fail: Return cached response
  Fallback: Offline error page

Cache-first (Assets):
  Try: Return from cache
  Miss: Fetch and cache
  Fallback: Placeholder

Stale-while-revalidate (HTML):
  Return: Cached version immediately
  Background: Fetch new version
  Next load: Shows new version
```

### Offline Sync
```typescript
// Frontend queues changes offline
await supabase.from('farms').update(data);
// ↓ Service Worker caches this
// ↓ When online, automatic retry via IndexedDB queue
// ↓ Server receives and confirms
```

---

## Deployment

### Environment Variables

**Frontend** (`.env`):
```
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_KEY=eyJ0...  # Anon key (public)
VITE_SENTRY_DSN=https://... # Optional error tracking
VITE_ROBOTS_POLICY=index, follow # Production only
```

**Backend** (`.env`):
```
DATABASE_URL=postgresql://... # Supabase connection
SUPABASE_SERVICE_ROLE=eyJ0... # Admin key (private!)
JWT_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
OPENWEATHER_API_KEY=...
```

### CI/CD Pipeline
```yaml
Frontend:
  1. Lint (ESLint)
  2. Test (Vitest + coverage)
  3. Build (Vite)
  4. Deploy to Vercel

Backend:
  1. Test (Node.js test runner)
  2. Build Docker image
  3. Deploy to Railway/Fly.io
```

---

## Decision Matrix: When to Use What

| Task | Supabase | Backend |
|------|----------|---------|
| Read user data | ✅ Yes | ❌ No |
| Real-time updates | ✅ Yes | ❌ No |
| List/filter/paginate | ✅ Yes | ❌ No |
| Authentication | ❌ No | ✅ Yes (SMS) |
| AI/ML prediction | ❌ No | ✅ Yes |
| External API calls | ❌ No | ✅ Yes |
| Payment processing | ❌ No | ✅ Yes |
| Bulk operations | ❌ No | ✅ Yes |
| File uploads | ⚠️ Via API | ✅ Yes |
| Rate limiting | ❌ No | ✅ Yes |

---

## Performance Considerations

### Database Queries
```typescript
// ❌ BAD: N+1 queries (1000 users = 1000 queries)
const users = await supabase.from('users').select('*');
for (const user of users) {
  const farms = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', user.id);
}

// ✅ GOOD: Single query with join
const data = await supabase
  .from('users')
  .select('*, farms(*)');
```

### Frontend State
```typescript
// ✅ Use React Query for caching
const { data } = useQuery(['farms'], () =>
  supabase.from('farms').select('*')
);
// Automatically refetches on window focus, deduplicates requests

// ❌ Don't fetch same data in multiple components
```

### Bundle Size
- Total: 1.7MB raw, 532KB gzip
- Critical path: 380KB gzip
- Per-route average: 18KB gzip
- Lazy-loaded: ✅ Yes (40+ route chunks)

---

## Monitoring & Observability

### Sentry Setup
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});

Sentry.captureException(error);
Sentry.captureMessage('User action completed');
```

### Logging
```typescript
// Backend
console.log('[API] Received crop recommendation request', {
  userId: req.user.id,
  farmId: req.body.farmId,
  timestamp: new Date().toISOString(),
});

// Frontend
console.log('[v0] Service Worker registered successfully');
```

---

## Troubleshooting

### "Supabase connection failed"
- Check VITE_SUPABASE_URL and VITE_SUPABASE_KEY
- Verify network connectivity
- Check Supabase project is active

### "RLS policy denies access"
- Verify user_id matches auth.uid()
- Check policy conditions in Supabase console
- Ensure user is authenticated

### "Service Worker not updating"
- Clear browser cache
- Unregister old SW in DevTools
- Restart dev server

### "Backend API 401 Unauthorized"
- Ensure Authorization header is sent
- Verify JWT token is valid
- Check backend middleware is verifying signature

---

## Best Practices Checklist

- ✅ Always validate inputs server-side (Zod)
- ✅ Always verify user identity in backend routes
- ✅ Never expose API keys in frontend code
- ✅ Use RLS policies to protect sensitive data
- ✅ Rate limit expensive operations
- ✅ Cache aggressively in frontend (React Query)
- ✅ Log important events for debugging
- ✅ Handle errors gracefully (Sentry)
- ✅ Test offline functionality regularly
- ✅ Monitor bundle size in CI/CD

---

## Related Documentation

- [Security Policy](../SECURITY.md)
- [Bundle Analysis](../BUNDLE_ANALYSIS.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [API Routes](./API_ROUTES.md) (if available)
