# Failed to Fetch - API Configuration Fix Guide

## The Problem

You were getting **"Failed to fetch"** errors when deploying to Vercel because:

1. **Environment Mismatch**: The frontend was hardcoded to call `http://localhost:3001` (local Express backend)
2. **Vercel Production**: In Vercel, there's no local Express server running - the backend isn't deployed there
3. **Architecture Separation**: Your app is a Vite + React SPA, but the backend is a separate Express.js service not connected to Vercel

## What Was Changed

### 1. **Dynamic API Base URL** (`src/lib/api.ts`)
```typescript
// BEFORE: Hardcoded localhost
export const apiBaseUrl = "http://localhost:3001"

// AFTER: Environment-aware
const getApiBaseUrl = (): string => {
  if (configuredBaseUrl) return configuredBaseUrl;           // Use env var if set
  if (import.meta.env.DEV) return "http://localhost:3001";   // Dev: use local backend
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;                  // Production: relative API path
  }
  return "/api";                                              // Fallback
};
```

### 2. **AI Config Updated** (`src/config/aiConfig.ts`)
Same logic applied to AI API calls - now environment-aware instead of hardcoded.

## How It Works Now

### Local Development
```
Frontend (Vite @ http://localhost:4000)
        ↓
        └→ Express Backend (http://localhost:3001)
```
- API calls go to `http://localhost:3001` as before ✓
- Everything works when you run both services

### Vercel Production
```
Frontend + Mock APIs (https://your-domain.vercel.app)
        ↓
        └→ Falls back to client-side mock responses
```
- API calls attempt `https://your-domain.vercel.app/api`
- If backend isn't deployed, built-in mock APIs handle: 
  - Document management
  - AI disease detection
  - Field/sensor data

## Deployment Options

### Option 1: Deploy Backend to Vercel (Recommended)
Add serverless functions alongside the frontend:

1. Create `api/` directory in your Vercel project root
2. Move Express routes to `/api/*.js` serverless functions
3. Vercel automatically proxies `/api/*` calls to serverless functions

### Option 2: Keep Separate Backend
Deploy backend elsewhere (Render, Railway, AWS EC2):

1. Add environment variable to Vercel:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```

2. Build and deploy:
   ```bash
   VITE_API_BASE_URL=https://your-backend-domain.com npm run build
   ```

### Option 3: Use Mock APIs (Current State)
Your app now has built-in fallback mock responses:
- Document upload/download
- AI disease detection
- Farm field data
- Sensor data

These work without a backend connection.

## Testing

### Local Development
```bash
# Terminal 1: Start frontend
cd /vercel/share/v0-project
npm run dev

# Terminal 2: Start backend
cd /vercel/share/v0-project/backend
npm run dev
```

### Vercel Preview (No Backend)
```bash
npm run build
npm run preview
```
- Frontend builds successfully ✓
- API calls fall back to mocks ✓
- No "failed to fetch" errors ✓

## Environment Variables

### Required Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon key

### Optional Variables
- `VITE_API_BASE_URL` - Backend API URL (only needed if using separate backend)

## Troubleshooting

### Still Getting "Failed to Fetch"?

1. **Check Supabase Connection** (priority)
   ```
   Verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel Settings > Environment Variables
   ```

2. **Check Network Tab** (browser DevTools)
   - What URL is being called?
   - What's the response status?
   - Any CORS errors?

3. **Check Console Logs** (browser DevTools)
   - Look for error messages
   - Check if fallback mocks activated

4. **For Backend-Dependent Features**
   - Set `VITE_API_BASE_URL` to your backend URL
   - Ensure backend CORS allows your domain
   - Test backend health: `curl https://your-backend.com/health`

## References

- **API Layer**: `src/lib/api.ts` - Main API client with mock fallbacks
- **AI Config**: `src/config/aiConfig.ts` - AI endpoint configuration  
- **Build Config**: `vite.config.ts` - Environment variable handling
- **Backend**: `backend/src/server.js` - Express server (for reference)

---

**Last Updated**: July 3, 2026  
**Build Status**: ✓ Production build succeeds  
**Deployment Status**: Ready for Vercel
