# Secure Key Generation & Update Guide

**IMPORTANT: Never share keys with me. Follow these steps yourself.**

---

## 1. Generate New Supabase Keys

### Step 1.1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project: **farm-intellect-65** (or your project name)
3. Click: **Settings** (bottom left sidebar)
4. Click: **API**

### Step 1.2: Get New Anon Public Key
```
You'll see a section called "Project API keys"
Copy the key labeled: "anon public"
This is your: VITE_SUPABASE_PUBLISHABLE_KEY
```

### Step 1.3: Get New Service Role Key
```
In same section, find: "service_role"
Copy this key
This is your: SUPABASE_SERVICE_ROLE_KEY
```

**Keep these keys ON YOUR COMPUTER ONLY. Do NOT share.**

---

## 2. Generate New Firebase API Key

### Step 2.1: Go to Firebase Console
1. Open: https://console.firebase.google.com
2. Select your project: **farmintellect65**
3. Click: **Project Settings** (gear icon, top left)

### Step 2.2: Get Web API Key
```
Go to: "Your apps" section
Find your web app
Copy the "apiKey" value
This is your: VITE_FIREBASE_API_KEY
```

**Keep this key ON YOUR COMPUTER ONLY. Do NOT share.**

---

## 3. Update Keys in Vercel (Directly, No Sharing)

### Step 3.1: Open Vercel Project Settings
1. Go: https://vercel.com/dashboard
2. Select: **farm-intellect-65** project
3. Click: **Settings** (top navigation)
4. Click: **Environment Variables** (left sidebar)

### Step 3.2: Update AI_API_KEY
```
1. Find: AI_API_KEY
2. Click the three dots (...)
3. Select: Edit
4. Paste your new OpenAI key (from your machine)
5. Click: Save
```

### Step 3.3: Update VITE_SUPABASE_PUBLISHABLE_KEY
```
1. Find: VITE_SUPABASE_PUBLISHABLE_KEY
2. Click the three dots (...)
3. Select: Edit
4. Paste your new Supabase anon key
5. Click: Save
```

### Step 3.4: Update SUPABASE_SERVICE_ROLE_KEY
```
1. Find: SUPABASE_SERVICE_ROLE_KEY
2. Click the three dots (...)
3. Select: Edit
4. Paste your new Supabase service role key
5. Click: Save
```

### Step 3.5: Update VITE_FIREBASE_API_KEY
```
1. Find: VITE_FIREBASE_API_KEY
2. Click the three dots (...)
3. Select: Edit
4. Paste your new Firebase key
5. Click: Save
```

### Step 3.6: Redeploy Your Project
```
1. Go to: Deployments
2. Find your latest deployment
3. Click the three dots (...)
4. Select: Redeploy
```

---

## 4. Update Local .env Files

### Step 4.1: Update Frontend .env
```bash
# File: /vercel/share/v0-project/.env

AI_API_KEY=sk-or-v1-... (your new key)
VITE_SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... (your new key)
VITE_FIREBASE_API_KEY=AIza... (your new key)
VITE_FIREBASE_AUTH_DOMAIN=farmintellect65.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=farmintellect65
VITE_FIREBASE_STORAGE_BUCKET=farmintellect65.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=960040509665
VITE_FIREBASE_APP_ID=1:960040509665:web:b5fe823a0a1b2cf18817a0
VITE_API_BASE_URL=http://localhost:3001
```

### Step 4.2: Update Backend .env
```bash
# File: /vercel/share/v0-project/backend/.env

AI_API_KEY=sk-or-v1-... (your new key)
SUPABASE_URL=https://exynaicvgadoenjfunqz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your new key)
VITE_FIREBASE_API_KEY=AIza... (your new key)
```

---

## 5. Test Everything Works

### Step 5.1: Run Local Dev Server
```bash
cd /vercel/share/v0-project
npm run dev
```

### Step 5.2: Check Console
```
Open browser console (F12)
Look for any errors
If no errors, keys are working ✅
```

### Step 5.3: Test Login
```
Try logging in
If successful, Supabase/Firebase keys work ✅
```

### Step 5.4: Test AI Features
```
Try using AI features
If successful, OpenAI key works ✅
```

---

## 6. Revoke Old Keys

### Step 6.1: Revoke Old OpenAI Key
```
1. Go: platform.openai.com/api/keys
2. Find: sk-zQjinsXk7GC70XJdERZEsUKHaHUn104Dho0e8eC7rVGJVUHK
3. Click: Delete
4. Confirm
```

### Step 6.2: Revoke Old Supabase Keys
```
1. Go: supabase.com/dashboard
2. Project Settings → API
3. Old keys are automatically replaced
4. No action needed (new keys are live)
```

### Step 6.3: Revoke Old Firebase Key
```
1. Go: console.firebase.google.com
2. Project Settings → Service Accounts
3. Old keys are automatically invalidated
4. No action needed
```

---

## 7. Verify Production Deployment

### Step 7.1: Visit Your Live App
```
Go to: your-vercel-domain.vercel.app
Test login
Test AI features
Check console for errors
```

### Step 7.2: Monitor Billing
```
OpenAI: platform.openai.com/account/billing
Firebase: console.firebase.google.com (Usage tab)
Supabase: supabase.com/dashboard (Usage tab)

Look for any unexpected charges
```

---

## Security Checklist

- [ ] Generated new Supabase anon key
- [ ] Generated new Supabase service role key
- [ ] Generated new Firebase API key
- [ ] Generated new OpenAI API key
- [ ] Updated AI_API_KEY in Vercel
- [ ] Updated VITE_SUPABASE_PUBLISHABLE_KEY in Vercel
- [ ] Updated SUPABASE_SERVICE_ROLE_KEY in Vercel
- [ ] Updated VITE_FIREBASE_API_KEY in Vercel
- [ ] Redeployed project on Vercel
- [ ] Updated local .env files
- [ ] Tested login locally
- [ ] Tested AI features locally
- [ ] Revoked old OpenAI key
- [ ] Verified production deployment works
- [ ] Checked billing for unauthorized usage

---

## Important Notes

✅ **Keys stay on your machine** - Not shared with v0
✅ **Vercel encrypts them** - Secure in cloud
✅ **Local .env is gitignored** - Not committed
✅ **Old keys are revoked** - Can't be used
❌ **Never paste keys in chat** - Always keep them private

---

## Need Help?

If you get errors:
1. Check console (F12) for specific error messages
2. Verify keys are correctly pasted (no extra spaces)
3. Verify old keys are actually revoked
4. Check Vercel deployment logs
5. Redeploy project after each key update

