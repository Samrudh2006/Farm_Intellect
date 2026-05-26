# Authentication Implementation Guide

## Overview

This guide covers the complete authentication setup for the Farm Intellect application, including Aadhaar-based authentication with Supabase, phone OTP verification, and backend integration.

## Architecture

### Frontend (React + Vite)
- **Supabase Client** (`src/integrations/supabase/client.ts`): Handles Aadhaar/passkey authentication
- **AuthContext** (`src/contexts/AuthContext.tsx`): Manages auth state and provides hooks
- **Login Page** (`src/pages/Login.tsx`): Comprehensive UI with multiple login methods

### Backend (Node.js/Express)
- **Auth Routes** (`backend/src/routes/auth.js`): RESTful endpoints for signup/login/OTP
- **Auth Middleware** (`backend/src/middleware/auth.js`): JWT verification and Supabase token resolution
- **OTP Utility** (`backend/src/utils/otp.js`): Email and SMS OTP delivery via Twilio/Nodemailer
- **Database** (`backend/prisma/schema.prisma`): PostgreSQL with Prisma ORM

### Supabase Edge Functions
- **send-otp** (`supabase/functions/send-otp/`): Generates and sends 6-digit OTPs via SMS
- **verify-otp** (`supabase/functions/verify-otp/`): Validates OTPs and returns reset tokens
- **reset-passkey** (`supabase/functions/reset-passkey/`): Resets user password via verified OTP

---

## Setup Instructions

### Prerequisites

1. **Node.js** v18 or higher
2. **PostgreSQL** database (local or remote)
3. **Supabase Project** with:
   - Database enabled
   - Auth configured (JWT secret generated)
   - OTP codes table created
4. **Twilio Account** (for SMS) or SMTP server (for email)
5. **Environment Variables** configured

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create `.env.local` (already created in `/backend/.env.local`):

```env
# Server
PORT=3001
NODE_ENV=development
APP_ENV=local
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/farm_intellect?schema=public

# Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Email (SMTP)
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USER=dev@farm-intellect.local
EMAIL_PASS=dev-password
OTP_EXPIRY_MINUTES=10

# SMS (Twilio - Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Supabase (Optional for backend token validation)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

#### Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

This will:
- Create all tables (users, profiles, OTP codes, etc.)
- Set up relationships and indexes
- Generate Prisma client

#### Start Backend Server

```bash
npm run dev
# Server runs on http://localhost:3001
```

### 2. Frontend Setup

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001
```

#### Start Development Server

```bash
npm run dev
# App runs on http://localhost:5173
```

### 3. Supabase Setup

#### Create OTP Codes Table

In Supabase SQL Editor, run:

```sql
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT otp_purpose_check CHECK (purpose IN ('login', 'signup', 'reset-passkey'))
);

CREATE INDEX idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);
```

#### Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy reset-passkey
```

---

## Authentication Flows

### Flow 1: Aadhaar + Passkey (Supabase Auth)

1. User enters 12-digit Aadhaar number
2. User creates a passkey (4+ characters)
3. **Signup**: Email derived from Aadhaar (`aadhaar_<number>@farmapp.local.io`)
4. Supabase creates user account
5. Backend receives webhook (optional) or auto-provisions user via JWT verification
6. User redirected to role-based dashboard

**Key Files:**
- `AuthContext.tsx` → `signUpWithAadhaar()`, `signInWithAadhaar()`
- `backend/src/middleware/auth.js` → `findOrProvisionSupabaseUser()`

### Flow 2: Phone OTP Login

1. User enters phone number
2. **SignInWithPhoneOTP** generates OTP (in-memory on frontend)
3. User enters 6-digit OTP
4. **VerifyPhoneOTP** validates and signs user in
5. User redirected to dashboard

**Note:** In production, replace in-memory OTP with Supabase edge function calls:

```typescript
// Example (currently in-memory simulation)
const { data } = await supabase.functions.invoke('send-otp', {
  body: { phone: '+91' + cleanPhone, purpose: 'login' }
});
```

**Key Files:**
- `AuthContext.tsx` → `signInWithPhoneOTP()`, `verifyPhoneOTP()`

### Flow 3: Password Reset

1. User initiates password reset on login page
2. **Forgot Password**: Requests OTP via phone
3. **OTP Verification**: Validates 6-digit code
4. **Reset Passkey**: Updates password in Supabase
5. User can now login with new passkey

**Key Files:**
- `Login.tsx` → Forgot Passkey UI section
- `supabase/functions/reset-passkey/index.ts`

---

## API Endpoints

### Backend Endpoints (Express.js)

#### Authentication

**POST `/api/auth/signup`**
- Create new user account
- Request body: `{ email, password, name, role, phone, location }`
- Response: `{ user: {...}, message: "..." }`

**POST `/api/auth/login`**
- Authenticate user
- Request body: `{ email, password, otpCode? }`
- Response: `{ token, user: {...}, message: "..." }`

**POST `/api/auth/verify-otp`**
- Verify OTP for signup/login/password-reset
- Request body: `{ userId, code, purpose }`
- Response: `{ message: "OTP verified successfully" }`

**POST `/api/auth/resend-otp`**
- Resend OTP to email/phone
- Request body: `{ userId, type: "EMAIL"|"SMS", purpose }`
- Response: `{ message: "OTP sent..." }`

**POST `/api/auth/forgot-password`**
- Request password reset OTP
- Request body: `{ email }`
- Response: `{ message: "..." }`

**POST `/api/auth/reset-password`**
- Reset password with OTP
- Request body: `{ email, otpCode, newPassword }`
- Response: `{ message: "Password reset successfully" }`

**POST `/api/auth/delete-account`** (Requires Auth)
- Delete/anonymize user account
- Request body: `{ password }`
- Response: `{ message: "Account anonymized successfully" }`

---

## Testing the Auth Flow

### Manual Testing

#### Test Signup (Aadhaar)

1. Navigate to `http://localhost:5173`
2. Click "Sign Up" tab
3. Select role (Farmer/Merchant/Expert)
4. Enter:
   - Aadhaar: `123456789012` (12 digits)
   - Name: `John Farmer`
   - Passkey: `Test@123` (must have uppercase, lowercase, digit, special char)
   - Confirm Passkey: `Test@123`
5. Click Sign Up
6. Check Supabase Auth dashboard for new user

#### Test Login (Aadhaar)

1. Navigate to `http://localhost:5173`
2. Keep "Login" tab selected
3. Select role
4. Enter:
   - Aadhaar: `123456789012`
   - Passkey: `Test@123`
5. Click Login
6. Should be redirected to dashboard

#### Test Phone OTP

1. On Login page, select "Phone OTP" tab
2. Enter phone number: `9876543210`
3. Click "Send OTP"
4. Copy OTP from browser console (in development)
5. Paste into OTP fields
6. Click "Verify OTP"

#### Test Password Reset

1. On Login page, click "Forgot Passkey?"
2. Select role
3. Enter phone number
4. Click "Send Reset Code"
5. Copy OTP from console
6. Enter OTP
7. Create new passkey
8. Login with new passkey

---

## Troubleshooting

### 1. "Backend not configured" Error

**Cause**: `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` missing

**Solution**:
```bash
# Check .env.local
cat .env.local | grep VITE_SUPABASE

# Verify values at: https://app.supabase.com/project/YOUR_PROJECT/settings/api
```

### 2. Database Connection Failed

**Cause**: Wrong `DATABASE_URL` in backend `.env.local`

**Solution**:
```bash
# Test connection
psql "postgresql://user:password@localhost:5432/farm_intellect?schema=public"

# If PostgreSQL not running locally
# Option A: Start PostgreSQL
# Option B: Use remote database (AWS RDS, Supabase PostgreSQL, etc.)
```

### 3. Prisma Client Not Found

**Cause**: Migrations not run

**Solution**:
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 4. OTP Not Sending

**Cause**: Twilio/Email not configured

**Solution**:
```bash
# For development, OTPs are logged to console
# Check backend terminal for: "OTP sent to..."

# To configure real SMS:
# 1. Get Twilio credentials from https://www.twilio.com/console
# 2. Add to backend/.env.local
# 3. Restart server
```

### 5. "Invalid token" on Backend API Calls

**Cause**: Missing Authorization header or expired token

**Solution**:
```bash
# The apiFetch in src/lib/api.ts automatically adds Bearer token
# If still failing, check:
# 1. Supabase session is active
# 2. JWT_SECRET in backend matches token signing
```

---

## Security Considerations

### Password/Passkey Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (`@$!%*?&`)

### Rate Limiting
- OTP requests: 8 per 10 minutes
- Login attempts: 5 per 15 minutes  
- Password resets: 6 per 15 minutes
- General API: 100 per 15 minutes

### Bcrypt Configuration
- Hash rounds: 12 (configurable via `BCRYPT_ROUNDS`)
- Higher rounds = more secure but slower

### JWT Tokens
- Default expiry: 7 days
- Signed with `JWT_SECRET`
- Contains: `userId`, `role`
- Validated in `authenticate` middleware

### Sensitive Data
- Passwords hashed with bcrypt, never stored plaintext
- OTP not transmitted in response, only status
- Reset tokens are OTP IDs (valid for 10 minutes)
- Session tokens use `httpOnly` and `secure` flags

---

## Next Steps

1. **Configure Email Service** (SMTP in backend)
2. **Configure SMS Service** (Twilio credentials)
3. **Deploy Supabase Functions** to production
4. **Set Production Environment Variables** (stronger JWT secret, real credentials)
5. **Setup Database Backups** (if using self-hosted PostgreSQL)
6. **Monitor Auth Events** (Supabase dashboard, custom logging)
7. **Setup CI/CD** (GitHub Actions, automated tests)

---

## Quick Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| Auth Context | `src/contexts/AuthContext.tsx` | Frontend auth state management |
| Auth Routes | `backend/src/routes/auth.js` | Backend endpoints |
| Auth Middleware | `backend/src/middleware/auth.js` | JWT verification |
| OTP Utils | `backend/src/utils/otp.js` | Email/SMS delivery |
| Edge Functions | `supabase/functions/*/` | SMS OTP & password reset |
| Prisma Schema | `backend/prisma/schema.prisma` | Database structure |

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend logs: `npm run dev` output
3. Check frontend console: DevTools → Console
4. Supabase Dashboard → Logs for edge function errors
