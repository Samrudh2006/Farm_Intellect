# Credential Regeneration Guide

## CRITICAL: All these credentials were exposed in git history and MUST be regenerated immediately!

Even though the current code is now secure, the old credentials are still visible if someone checks out older commits. **REGENERATE ALL KEYS NOW.**

---

## 1. OpenAI API Key

### Exposed Key Details:
- **Old Key:** `sk-zQjinsXk7GC70XJdERZEsUKHaHUn104Dho0e8eC7rVGJVUHK`
- **Exposed In:** 
  - `src/config/aiConfig.ts`
  - `src/utils/aiFeatureTest.ts`
  - `src/pages/Settings.tsx`
- **Git Commits:** Multiple commits prior to security fix

### How to Regenerate:

1. Go to: https://platform.openai.com/api/keys
2. Click on your old key and select **"Delete"**
3. Click **"Create new secret key"**
4. Copy the new key (starts with `sk-`)
5. Store it securely - you won't see it again

### How to Update:

**In Vercel Project Settings:**
1. Go to your Vercel Project → Settings (⚙️ top right)
2. Click **"Vars"** tab
3. Find `AI_API_KEY` 
4. Click the key, paste new key, click **"Save"**
5. Redeploy your project

**In Your Local `.env` file:**
```env
AI_API_KEY=sk-<your-new-key>
REACT_APP_AI_API_KEY=sk-<your-new-key>
```

### Verify It Works:
```bash
cd /vercel/share/v0-project
npm run dev
# Test in browser - go to Settings page
# Check browser console for any AI errors
```

---

## 2. Supabase Anon Key

### Exposed Key Details:
- **Old Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eW5haWN2Z2Fkb2VuamZ1bnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzUwNjgsImV4cCI6MjA4ODM1MTA2OH0.T-xiyOGqzXkfFrg1FxsRyb6f_ErMMKGH8CmBOyVqgu8`
- **Project URL:** `https://exynaicvgadoenjfunqz.supabase.co`
- **Exposed In:** `src/integrations/supabase/client.ts`
- **Risk:** Anyone could read/write to your database with this key

### How to Regenerate:

1. Go to: https://supabase.com/dashboard/projects
2. Select your project: **farm-intellect-65** (or similar)
3. Go to **Settings → API**
4. Under **Project API keys**:
   - Copy the new **Anon Public** key
   - Copy the new **Service Role** key (backend only)
5. Delete or ignore the old one

### How to Update:

**In Vercel Project Settings:**
1. Go to your Vercel Project → Settings (⚙️ top right)
2. Click **"Vars"** tab
3. Update these variables with new keys:
   - `VITE_SUPABASE_URL` - (stays same, just verify)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - (paste new anon key)
4. Backend vars:
   - `SUPABASE_SERVICE_ROLE_KEY` - (paste new service role key)
5. Click **"Save"** and redeploy

**In Your Local `.env` file:**
```env
VITE_SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<new-anon-key>
```

**In Your Backend `.env` file:**
```env
SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<new-service-role-key>
SUPABASE_ANON_KEY=<new-anon-key>
```

### Verify It Works:
- Try logging in with Supabase auth
- Check that database queries work
- Look at browser DevTools → Network to ensure API calls succeed

---

## 3. Firebase API Key

### Exposed Key Details:
- **Old Key:** `AIzaSyD4sPDW7IzQk63CLjOlXf_QA_lP-BINvMQ`
- **Project ID:** `farmintellect65`
- **Exposed In:** `src/integrations/firebase/client.ts`
- **Associated Data:**
  - Auth Domain: `farmintellect65.firebaseapp.com`
  - Storage Bucket: `farmintellect65.firebasestorage.app`
  - Messaging ID: `960040509665`
  - App ID: `1:960040509665:web:b5fe823a0a1b2cf18817a0`

### How to Regenerate:

1. Go to: https://console.firebase.google.com/
2. Select project: **farmintellect65**
3. Go to **Project Settings → Service Accounts**
4. Click **"Generate New Private Key"** (for backend)
5. Go back to **Project Settings → Web Apps**
6. The API key in **Firebase SDK snippet** is the one you use
7. Firebase automatically rotates keys, but you can create new ones if needed

### How to Update:

**In Vercel Project Settings:**
1. Go to your Vercel Project → Settings (⚙️ top right)
2. Click **"Vars"** tab
3. Update all Firebase variables:
   - `VITE_FIREBASE_API_KEY` - (web key from Firebase)
   - `VITE_FIREBASE_AUTH_DOMAIN` - (stays same: farmintellect65.firebaseapp.com)
   - `VITE_FIREBASE_PROJECT_ID` - (stays same: farmintellect65)
   - `VITE_FIREBASE_STORAGE_BUCKET` - (stays same: farmintellect65.firebasestorage.app)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` - (stays same)
   - `VITE_FIREBASE_APP_ID` - (stays same)
4. For backend, add:
   - `FIREBASE_SERVICE_ACCOUNT_KEY` - (paste the JSON from private key download)
   - `FIREBASE_PROJECT_ID` - (farmintellect65)
5. Click **"Save"** and redeploy

**In Your Local `.env` file:**
```env
VITE_FIREBASE_API_KEY=<new-api-key>
VITE_FIREBASE_AUTH_DOMAIN=farmintellect65.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=farmintellect65
VITE_FIREBASE_STORAGE_BUCKET=farmintellect65.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=960040509665
VITE_FIREBASE_APP_ID=1:960040509665:web:b5fe823a0a1b2cf18817a0
VITE_FIREBASE_MEASUREMENT_ID=G-FG6QGRRP9W
```

### Verify It Works:
- Test Firebase authentication (sign up, login)
- Check that Firebase storage works
- Look at browser DevTools → Network for Firebase API calls

---

## 4. OpenWeatherMap API Key

### Status:
- **Potentially Exposed:** Unknown if hardcoded anywhere
- **Referenced In:** `.env.example` (template, no real key)
- **Risk Level:** If exposed, someone could use your API quota

### How to Check If Exposed:
```bash
cd /vercel/share/v0-project
grep -r "openweathermap\|OWM_API_KEY" src/ backend/ --include="*.ts" --include="*.tsx" --include="*.js"
```

If you find it hardcoded anywhere:
1. Go to: https://openweathermap.org/api
2. Delete old key from your account
3. Generate new key
4. Update in Vercel Vars: `VITE_OWM_API_KEY`
5. Update local `.env` file

---

## Step-by-Step Checklist

### ✅ Phase 1: Regenerate All Keys (Do NOW)

- [ ] OpenAI API Key - regenerated
- [ ] Supabase Anon Key - regenerated
- [ ] Supabase Service Role Key - regenerated
- [ ] Firebase API Key - verified/regenerated
- [ ] OpenWeatherMap API Key - checked and regenerated if exposed

### ✅ Phase 2: Update Vercel Environment Variables

1. [ ] Go to Vercel Project Settings → Vars
2. [ ] Update ALL variables with new keys:
   - `AI_API_KEY=sk-...`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJ...`
   - `VITE_FIREBASE_API_KEY=AIza...`
   - `VITE_OWM_API_KEY=...`
3. [ ] Click "Save"
4. [ ] Redeploy project

### ✅ Phase 3: Update Local Environment Files

1. [ ] Update `.env` in root with new keys
2. [ ] Update `backend/.env` with new keys
3. [ ] Run locally: `npm run dev`
4. [ ] Test all features work

### ✅ Phase 4: Check for Unauthorized Usage

1. [ ] OpenAI Billing: https://platform.openai.com/account/billing
2. [ ] Firebase Billing: https://console.firebase.google.com/
3. [ ] Supabase Billing: https://supabase.com/dashboard
4. [ ] Look for unusual charges or API usage

### ✅ Phase 5: Verify Everything Works

1. [ ] Frontend dev server starts without errors
2. [ ] Backend dev server starts without errors
3. [ ] Test authentication flows
4. [ ] Test database queries
5. [ ] Test AI features
6. [ ] Test file storage (if applicable)

---

## Why This Matters

### Security Timeline:

1. **Past (Credentials Exposed):**
   - Old keys in git history → anyone with repo access can see them
   - Keys in hardcoded source code → visible to entire internet

2. **Now (Code is Clean):**
   - Current source code has NO keys ✅
   - All keys are in environment variables ✅
   - `.env` file is gitignored (not in repo) ✅

3. **Future (Completely Secure):**
   - New credentials never exposed ✅
   - Old credentials are revoked ✅
   - No one can use old keys to access your services ✅

### Potential Damage if Old Keys Are Used:

- **OpenAI:** Someone could rack up API charges against your account
- **Supabase:** Someone could read/modify all your database data
- **Firebase:** Someone could access user data and authentication tokens
- **Cost:** Could be $100s to $1000s per day if exploited heavily

---

## When You're Done

After completing all steps, your application will be:

✅ **Secure:** No credentials in code or git history  
✅ **Protected:** Old compromised keys are revoked  
✅ **Verified:** All features work with new keys  
✅ **Monitored:** You can check billing for unauthorized usage  

**You're now protected from credential exposure!**
