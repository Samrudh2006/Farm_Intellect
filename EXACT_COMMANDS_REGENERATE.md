# Exact Commands to Regenerate Keys

## Part 1: OpenAI API Key Regeneration

### Manual Steps:
1. Go to: https://platform.openai.com/api/keys
2. Find your old key (starts with `sk-zQjinsXk7GC70XJdERZEsUKHaHUn104...`)
3. Click the trash icon to **Delete it**
4. Click **"Create new secret key"**
5. Copy the new key (looks like: `sk-proj-XXXXXXXXXXXXXXXXXXXXXX`)
6. **Important:** Save it somewhere safe - you won't see it again

### Your Old Key (REVOKE IMMEDIATELY):
```
sk-zQjinsXk7GC70XJdERZEsUKHaHUn104Dho0e8eC7rVGJVUHK
```

### Update Your Code After Getting New Key:

In Vercel Project Settings:
```
AI_API_KEY=sk-<your-new-key-here>
```

In local `.env`:
```env
AI_API_KEY=sk-<your-new-key-here>
REACT_APP_AI_API_KEY=sk-<your-new-key-here>
```

---

## Part 2: Supabase Keys Regeneration

### Manual Steps:
1. Go to: https://supabase.com/dashboard/projects
2. Click your project: **farm-intellect-65** (or similar)
3. Go to **Settings → API**
4. Find section: **Project API keys**
5. Copy the **new Anon Public** key (starts with `eyJ`)
6. Copy the **new Service Role** key (starts with `eyJ`)

### Your Old Keys (REVOKE IMMEDIATELY):
```
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eW5haWN2Z2Fkb2VuamZ1bnF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzUwNjgsImV4cCI6MjA4ODM1MTA2OH0.T-xiyOGqzXkfFrg1FxsRyb6f_ErMMKGH8CmBOyVqgu8

Service Role: (also exposed, need to regenerate)
```

### Update Your Code After Getting New Keys:

In Vercel Project Settings:
```
VITE_SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ<your-new-anon-key>
SUPABASE_SERVICE_ROLE_KEY=eyJ<your-new-service-role-key>
```

In local `.env`:
```env
VITE_SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ<your-new-anon-key>
```

In local `backend/.env`:
```env
SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
SUPABASE_ANON_KEY=eyJ<your-new-anon-key>
SUPABASE_SERVICE_ROLE_KEY=eyJ<your-new-service-role-key>
```

---

## Part 3: Firebase API Key Regeneration

### Manual Steps:
1. Go to: https://console.firebase.google.com/
2. Click your project: **farmintellect65**
3. Go to **Project Settings** (gear icon)
4. Look for **Your apps** section and your web app
5. In **SDK setup and configuration**, copy the **apiKey** value
6. For backend service account:
   - Go to **Service Accounts** tab
   - Click **"Generate New Private Key"**
   - Save the JSON file somewhere safe

### Your Old Key (REVOKE IMMEDIATELY):
```
APIzaSyD4sPDW7IzQk63CLjOlXf_QA_lP-BINvMQ
```

### Associated Information (Stays the Same):
```
authDomain: farmintellect65.firebaseapp.com
projectId: farmintellect65
storageBucket: farmintellect65.firebasestorage.app
messagingSenderId: 960040509665
appId: 1:960040509665:web:b5fe823a0a1b2cf18817a0
measurementId: G-FG6QGRRP9W
```

### Update Your Code After Getting New Key:

In Vercel Project Settings:
```
VITE_FIREBASE_API_KEY=AIza<your-new-key>
VITE_FIREBASE_AUTH_DOMAIN=farmintellect65.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=farmintellect65
VITE_FIREBASE_STORAGE_BUCKET=farmintellect65.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=960040509665
VITE_FIREBASE_APP_ID=1:960040509665:web:b5fe823a0a1b2cf18817a0
VITE_FIREBASE_MEASUREMENT_ID=G-FG6QGRRP9W
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

In local `.env`:
```env
VITE_FIREBASE_API_KEY=AIza<your-new-key>
VITE_FIREBASE_AUTH_DOMAIN=farmintellect65.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=farmintellect65
VITE_FIREBASE_STORAGE_BUCKET=farmintellect65.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=960040509665
VITE_FIREBASE_APP_ID=1:960040509665:web:b5fe823a0a1b2cf18817a0
VITE_FIREBASE_MEASUREMENT_ID=G-FG6QGRRP9W
```

---

## Part 4: OpenWeatherMap API Key

### Check If Exposed:
```bash
cd /vercel/share/v0-project
grep -r "openweathermap\|OWM_API_KEY" src/ backend/ --include="*.ts" --include="*.tsx" --include="*.js"
```

### If Found Hardcoded:
1. Go to: https://openweathermap.org/api
2. Go to your account → API keys
3. Delete old key
4. Create new key

### Update Your Code:

In Vercel Project Settings:
```
VITE_OWM_API_KEY=<your-new-key>
```

In local `.env`:
```env
VITE_OWM_API_KEY=<your-new-key>
```

---

## Complete `.env` File Template

After regenerating all keys, your `.env` should look like:

```env
# AI Configuration
AI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_AI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyD4sPDW7IzQk63CLjOlXf_QA_lP-BINvMQ
VITE_FIREBASE_AUTH_DOMAIN=farmintellect65.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=farmintellect65
VITE_FIREBASE_STORAGE_BUCKET=farmintellect65.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=960040509665
VITE_FIREBASE_APP_ID=1:960040509665:web:b5fe823a0a1b2cf18817a0
VITE_FIREBASE_MEASUREMENT_ID=G-FG6QGRRP9W

# Supabase Configuration
VITE_SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=exynaicvgadoenjfunqz
VITE_API_BASE_URL=http://localhost:3001

# OpenWeatherMap
VITE_OWM_API_KEY=<your-owm-key>
```

---

## Complete `backend/.env` File Template

```env
PORT=3001
NODE_ENV=development
APP_ENV=local
FRONTEND_URL=http://localhost:5173

# AI Configuration
AI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"farmintellect65",...}
FIREBASE_PROJECT_ID=farmintellect65

# Supabase Configuration
SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing After Regeneration

### Test All Services Work:

```bash
# Start dev server
cd /vercel/share/v0-project
npm run dev

# In another terminal, run tests
npm run test  # if you have tests

# Manual testing checklist:
# 1. Visit http://localhost:5173
# 2. Try to login (tests Firebase)
# 3. If there's a database, make a query (tests Supabase)
# 4. If there's an AI feature, test it (tests OpenAI)
# 5. If there's weather feature, test it (tests OpenWeatherMap)
# 6. Check browser console for errors
```

### Check for Errors in Console:

Look for these errors in browser DevTools console:
- ❌ "API_API_KEY is not configured"
- ❌ "SUPABASE_URL is not set"
- ❌ "Firebase initialization failed"

If you see these, your keys aren't set in `.env` yet.

---

## Verify Billing (Check for Unauthorized Usage)

After regenerating, check if anyone used your old keys:

### OpenAI Billing:
1. Go to: https://platform.openai.com/account/billing/overview
2. Look for "Usage" or "API Usage"
3. Check if there are unexpected API calls
4. Look at: https://platform.openai.com/account/billing/usage

### Firebase Billing:
1. Go to: https://console.firebase.google.com/
2. Select your project
3. Go to **Billing** (⚙️ Settings → Billing)
4. Look for unexpected charges

### Supabase Billing:
1. Go to: https://supabase.com/dashboard
2. Go to **Settings → Billing**
3. Look for unusual usage or charges

### Action if You Find Unauthorized Usage:
- Contact the service's support immediately
- Document everything with screenshots
- Request investigation and reversal of charges

---

## Summary: What To Do Right Now

1. **Next 5 minutes:** Follow Part 1-4 above to regenerate all keys
2. **Next 5 minutes:** Update Vercel environment variables
3. **Next 5 minutes:** Update local `.env` and `backend/.env` files
4. **Next 5 minutes:** Test that everything works
5. **Next 2 minutes:** Check billing for unauthorized usage

**Total time: 20 minutes**

**After that: You're fully secure!**
