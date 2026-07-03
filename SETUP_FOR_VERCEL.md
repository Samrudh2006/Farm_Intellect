# Setup for Vercel Deployment - Real Backend

Your app is now configured to deploy with the **real backend** (not mocks) to Vercel. Follow these steps:

## Step 1: Configure Environment Variables in Vercel

Go to Vercel Dashboard → Project Settings → Environment Variables

Add **all these required variables**:

### Database (Required)
```
DATABASE_URL=postgresql://username:password@host:5432/database_name
DIRECT_URL=postgresql://username:password@host:5432/database_name?sslmode=require
```
Get these from Supabase → Settings → Database → Connection Pooling

### Backend Security
```
JWT_SECRET=generate-a-random-string-with-32-chars-minimum
NODE_ENV=production
```

### Frontend URL
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
VITE_API_BASE_URL=https://your-vercel-domain.vercel.app/api
```
(Replace `your-vercel-domain` with your actual Vercel project name)

### Optional but Recommended
```
SENTRY_DSN=your_sentry_dsn_if_using_sentry
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
```

## Step 2: Run Database Migrations

Before deploying, ensure your database is up to date.

**Option A: Run locally** (Recommended first time)
```bash
npm install
npm install --prefix backend
DATABASE_URL=your_connection_string npm --prefix backend run db:migrate:deploy
```

**Option B: Run on Vercel after deployment**
- Deploy first
- Then run: `vercel env pull` to get env vars locally
- Then run: `DATABASE_URL=... npm --prefix backend run db:migrate:deploy`

## Step 3: Deploy

Simply push to main:
```bash
git push origin main
```

Vercel will automatically:
1. ✓ Install frontend + backend dependencies
2. ✓ Build frontend (Vite)
3. ✓ Prepare backend for serverless
4. ✓ Set up API proxy (/api routes)
5. ✓ Deploy everything

## Step 4: Verify It Works

Once deployed, test:

```bash
# Test frontend loads
curl https://your-vercel-domain.vercel.app

# Test backend is running
curl https://your-vercel-domain.vercel.app/api/health
```

You should see the frontend load and the API should respond.

## Development Locally

To test everything before deploying:

```bash
# Install both frontend and backend
npm install
npm install --prefix backend

# Create .env file with your local database
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Run both frontend and backend together
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## Architecture Summary

```
┌─ Vercel Deployment ──────────────────┐
│                                       │
│  ┌─ Frontend (Vite) ────────────────┐ │
│  │ React app builds to /dist        │ │
│  │ Runs on Vercel edge              │ │
│  └──────────────────────────────────┘ │
│                                       │
│  ┌─ Backend (Express) ──────────────┐ │
│  │ Runs on Vercel Serverless        │ │
│  │ Accessed via /api/* routes       │ │
│  │ Connects to Supabase database    │ │
│  └──────────────────────────────────┘ │
│                                       │
│  API calls: /api/* → Backend routes   │
│                                       │
└───────────────────────────────────────┘
```

## Files That Changed

- ✅ `package.json` - Added root scripts for monorepo
- ✅ `vercel.json` - Configure backend, rewrites, build settings
- ✅ `src/lib/api.ts` - Frontend API client (uses /api in production)
- ✅ `src/config/aiConfig.ts` - AI config (uses /api in production)
- ✅ `DEPLOYMENT_GUIDE.md` - Full deployment reference

## Troubleshooting

### "Failed to fetch" errors after deployment
- [ ] Check all environment variables are set in Vercel
- [ ] Verify DATABASE_URL is correct
- [ ] Check Vercel function logs for backend errors
- [ ] Make sure migrations ran successfully

### Socket.io connection issues
- [ ] Verify FRONTEND_URL is set correctly
- [ ] Check backend CORS configuration
- [ ] Check Vercel logs for connection errors

### Build fails
- [ ] Check Node.js version (should be 20.x)
- [ ] Verify both package.json files exist
- [ ] Check build logs in Vercel deployment page

## Next Steps

1. **Set environment variables** in Vercel (see Step 1 above)
2. **Run migrations** (see Step 2 above)  
3. **Deploy** by pushing to main (see Step 3 above)
4. **Test** the deployed app (see Step 4 above)

## Support

- Full details in `DEPLOYMENT_GUIDE.md`
- Check Vercel logs for errors
- Check backend logs in Vercel Functions tab

You're all set! Your app now deploys with the real backend to Vercel! 🚀
