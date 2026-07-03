# Farm Intellect - Deployment Guide

This guide explains how to deploy Farm Intellect with both frontend and backend to Vercel.

## Architecture

- **Frontend**: Vite + React SPA
- **Backend**: Express.js with Socket.io, Prisma ORM, Supabase database
- **Deployment**: Both run on the same Vercel project

## Deployment Steps

### 1. Prerequisites

Ensure you have:
- Supabase project (for database)
- Vercel account
- GitHub repository connected to Vercel

### 2. Environment Variables

Set these in Vercel project settings:

**Database (Supabase)**
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
DIRECT_URL=postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

**Authentication & Security**
```
JWT_SECRET=your_jwt_secret_key
SENTRY_DSN=https://your-sentry-dsn
```

**Frontend URLs**
```
FRONTEND_URL=https://your-domain.vercel.app
VITE_API_BASE_URL=https://your-domain.vercel.app/api
```

**Email & Notifications**
```
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=your_twilio_phone
```

**Firebase (optional)**
```
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_key
FIREBASE_CLIENT_EMAIL=your_firebase_email
```

**Rate Limiting**
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Vercel Configuration

The `vercel.json` is already configured for:
- Frontend build: `npm run build` → `dist` folder
- Backend installation: `npm install && npm install --prefix backend`
- API rewrites: `/api/*` requests go to backend

### 4. Database Migrations

Before deploying, ensure migrations are up to date:

```bash
# Locally
npm --prefix backend run db:migrate:deploy

# On Vercel
# Set DATABASE_URL in production environment first, then:
# The build process will automatically handle migrations if configured
```

### 5. Deploy

Push to main branch:
```bash
git push origin main
```

Vercel will automatically:
1. Install both frontend and backend dependencies
2. Build the frontend (Vite)
3. Prepare backend for serverless deployment
4. Deploy to your Vercel URL

### 6. Verify Deployment

Check that the deployed app works:

```bash
# Test frontend
curl https://your-domain.vercel.app

# Test backend API
curl https://your-domain.vercel.app/api/health
```

## Development

### Local Setup

```bash
# Install all dependencies
npm install
npm install --prefix backend

# Start both frontend and backend
npm run dev

# Frontend runs on http://localhost:5173
# Backend runs on http://localhost:3001
```

### Development Commands

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build everything
npm run build

# Test
npm run test

# Database operations
npm --prefix backend run db:migrate
npm --prefix backend run db:studio
```

## Architecture Details

### API Base URL Resolution

The frontend automatically resolves the API base URL:
- **Development**: `http://localhost:3001` (local backend)
- **Production**: `/api` (same origin via Vercel proxy)
- **Custom**: Set `VITE_API_BASE_URL` env var to use different backend

### Backend on Vercel

When deployed to Vercel:
1. Backend Express app runs as serverless functions
2. All `/api/*` routes are rewritten to the backend server
3. Socket.io connections work through Vercel's proxy
4. Database connections use Supabase (not local)

### Key Files

- `vercel.json` - Vercel configuration
- `package.json` - Root scripts for monorepo
- `backend/package.json` - Backend dependencies
- `src/lib/api.ts` - Frontend API client
- `src/config/aiConfig.ts` - AI service configuration

## Troubleshooting

### "Failed to fetch" errors
- Check that all environment variables are set in Vercel
- Verify database connection string is correct
- Check backend logs in Vercel deployment

### Socket.io connection issues
- Verify `FRONTEND_URL` is set correctly in environment
- Check CORS configuration in `backend/src/server.js`
- Verify WebSocket is allowed in your Vercel settings

### Database migration issues
- Run migrations before deploying: `npm --prefix backend run db:migrate:deploy`
- Check DATABASE_URL and DIRECT_URL are both set
- Review Prisma logs in Vercel function logs

### Build failures
- Check that both `package.json` files have correct dependencies
- Verify Node.js version compatibility (Node 20.x recommended)
- Review build logs in Vercel deployment page

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations completed
- [ ] FRONTEND_URL and VITE_API_BASE_URL configured
- [ ] JWT_SECRET is strong and random
- [ ] SENTRY_DSN configured for error tracking
- [ ] Rate limiting configured
- [ ] Email/SMS provider credentials set
- [ ] CORS origins whitelisted
- [ ] Helmet security headers enabled
- [ ] Database backups configured in Supabase

## Support

For issues:
1. Check Vercel deployment logs
2. Check backend function logs in Vercel
3. Check Supabase database status
4. Review error messages in browser console
