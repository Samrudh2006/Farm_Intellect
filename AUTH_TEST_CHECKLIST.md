# Authentication Testing Checklist

## Pre-Testing Setup

### Backend Preparation
- [ ] Backend `.env.local` created with all required variables
- [ ] PostgreSQL database is running and accessible
- [ ] Prisma migrations applied (`npx prisma migrate dev`)
- [ ] Backend server started (`npm run dev` in `/backend`)
- [ ] Server listening on `http://localhost:3001`
- [ ] Check backend logs for errors

### Frontend Preparation
- [ ] Frontend `.env.local` created with Supabase credentials
- [ ] Node modules installed (`npm install`)
- [ ] Frontend dev server started (`npm run dev`)
- [ ] App accessible at `http://localhost:5173`
- [ ] Browser console open (F12 → Console tab)

### Supabase Preparation
- [ ] Supabase project created at supabase.com
- [ ] OTP codes table created (SQL provided in guide)
- [ ] Edge functions deployed (send-otp, verify-otp, reset-passkey)
- [ ] Database URL matches backend configuration
- [ ] Auth section configured with JWT secret

---

## Test Suite 1: Signup (Aadhaar + Passkey)

### Test Case 1.1: Valid Signup

**Steps:**
1. Load login page at `http://localhost:5173`
2. Click "Sign Up" tab
3. Select "Farmer" role
4. Enter:
   - Aadhaar: `123456789012`
   - Name: `Test Farmer`
   - Passkey: `SecurePass123!`
   - Confirm Passkey: `SecurePass123!`
5. Click "Sign Up"

**Expected Results:**
- [ ] No error messages displayed
- [ ] Browser redirects to farmer dashboard
- [ ] Console shows successful auth messages
- [ ] User appears in Supabase Auth dashboard
- [ ] User profile created in database

---

### Test Case 1.2: Passkey Validation - Too Short

**Steps:**
1. Select role and click "Sign Up" tab
2. Try to signup with passkey: `short`

**Expected Results:**
- [ ] Error: "Passkey must be at least 4 characters"
- [ ] Form not submitted

---

### Test Case 1.3: Passkey Validation - Mismatch

**Steps:**
1. Enter passkey: `ValidPass123!`
2. Confirm passkey: `DifferentPass123!`
3. Click "Sign Up"

**Expected Results:**
- [ ] Error: "Passkeys do not match"
- [ ] Form not submitted

---

### Test Case 1.4: Invalid Aadhaar Format

**Steps:**
1. Enter Aadhaar: `12345` (too short)
2. Enter valid passkey
3. Click "Sign Up"

**Expected Results:**
- [ ] Error: "Invalid 12-digit Aadhaar number"
- [ ] Form not submitted

---

### Test Case 1.5: Duplicate Email (Already Exists)

**Steps:**
1. First signup with Aadhaar: `123456789012`
2. Logout
3. Try to signup again with same Aadhaar: `123456789012`

**Expected Results:**
- [ ] Error: "User already exists" or similar
- [ ] Form not submitted

---

## Test Suite 2: Login (Aadhaar + Passkey)

### Test Case 2.1: Valid Login

**Prerequisites:** User created from Test Case 1.1

**Steps:**
1. Load login page
2. Select "Farmer" role
3. Enter:
   - Aadhaar: `123456789012`
   - Passkey: `SecurePass123!`
4. Click "Login"

**Expected Results:**
- [ ] Successfully authenticated
- [ ] Redirected to farmer dashboard
- [ ] User profile visible
- [ ] Session token in browser

---

### Test Case 2.2: Wrong Password

**Steps:**
1. Select role
2. Enter valid Aadhaar
3. Enter wrong passkey: `WrongPass123!`
4. Click "Login"

**Expected Results:**
- [ ] Error: "Invalid credentials"
- [ ] Not redirected to dashboard

---

### Test Case 2.3: Non-Existent Aadhaar

**Steps:**
1. Enter non-existent Aadhaar: `999999999999`
2. Enter any passkey
3. Click "Login"

**Expected Results:**
- [ ] Error: "Invalid credentials"
- [ ] Not redirected

---

### Test Case 2.4: Rate Limiting (5+ Attempts)

**Steps:**
1. Attempt login with wrong password 5 times in succession
2. Try 6th login attempt

**Expected Results:**
- [ ] After 5 failed attempts, account temporarily locked
- [ ] Error: "Account Temporarily Locked" or "Too many attempts"
- [ ] After ~15 minutes, can try again

---

## Test Suite 3: Phone OTP Login

### Test Case 3.1: Send OTP

**Steps:**
1. Load login page
2. Select role
3. Click "Phone OTP" tab
4. Enter phone number: `9876543210`
5. Click "Send OTP"

**Expected Results:**
- [ ] No error displayed
- [ ] "OTP sent" message appears
- [ ] Check browser console for generated OTP (development mode)
- [ ] OTP expires after 5 minutes (front-end timer shows)

---

### Test Case 3.2: Verify OTP - Valid

**Steps:**
1. Complete Test Case 3.1
2. Copy OTP from console (format: 6 digits)
3. Enter OTP in input fields (one digit per box)
4. Click "Verify OTP"

**Expected Results:**
- [ ] OTP validated successfully
- [ ] User created (if new) or logged in (if existing)
- [ ] Redirected to role-based dashboard

---

### Test Case 3.3: Verify OTP - Invalid

**Steps:**
1. Send OTP (Test Case 3.1)
2. Enter wrong OTP: `000000`
3. Click "Verify OTP"

**Expected Results:**
- [ ] Error: "Invalid OTP. Please try again."
- [ ] Not logged in

---

### Test Case 3.4: OTP Expiration

**Steps:**
1. Send OTP
2. Wait 5+ minutes
3. Try to enter OTP

**Expected Results:**
- [ ] OTP input disabled or shows "expired"
- [ ] Error: "OTP expired. Please request a new one."
- [ ] Button to resend OTP appears

---

## Test Suite 4: Password/Passkey Reset

### Test Case 4.1: Forgot Passkey Flow

**Steps:**
1. On login page, click "Forgot Passkey?"
2. Select role
3. Enter phone number: `9876543210`
4. Click "Send Reset Code"

**Expected Results:**
- [ ] OTP generated and sent
- [ ] "OTP sent to your phone" message
- [ ] Page shows OTP input
- [ ] Console shows 6-digit OTP (dev mode)

---

### Test Case 4.2: Reset Passkey - Valid

**Steps:**
1. Complete Test Case 4.1
2. Enter OTP from console
3. Click "Verify OTP"
4. Enter new passkey: `NewPass456!`
5. Confirm new passkey: `NewPass456!`
6. Click "Reset Passkey"

**Expected Results:**
- [ ] Success message: "Passkey reset successfully"
- [ ] Redirected to login page
- [ ] Can login with new passkey
- [ ] Old passkey no longer works

---

### Test Case 4.3: Reset Passkey - Invalid OTP

**Steps:**
1. Click "Forgot Passkey?"
2. Try to proceed with wrong OTP: `000000`

**Expected Results:**
- [ ] Error: "Invalid or expired OTP"
- [ ] Cannot proceed to new passkey entry

---

## Test Suite 5: Role-Based Redirects

### Test Case 5.1: Farmer Role Redirect

**Steps:**
1. Signup/Login as Farmer
2. Verify role in signup form: Select "Farmer"

**Expected Results:**
- [ ] After login, redirected to `/farmer/dashboard`
- [ ] Dashboard shows farmer-specific features

---

### Test Case 5.2: Merchant Role Redirect

**Steps:**
1. Signup as Merchant
2. Login as Merchant

**Expected Results:**
- [ ] Redirected to `/merchant/dashboard`
- [ ] Dashboard shows merchant-specific features

---

### Test Case 5.3: Expert Role Redirect

**Steps:**
1. Signup as Expert
2. Login as Expert

**Expected Results:**
- [ ] Redirected to `/expert/dashboard`
- [ ] Dashboard shows expert-specific features

---

## Test Suite 6: Session & Logout

### Test Case 6.1: Session Persistence

**Steps:**
1. Login successfully
2. Reload page (F5)

**Expected Results:**
- [ ] Still logged in (no redirect to login)
- [ ] User info preserved
- [ ] Dashboard loads normally

---

### Test Case 6.2: Logout

**Steps:**
1. Login successfully
2. Click "Logout" button

**Expected Results:**
- [ ] Logged out successfully
- [ ] Redirected to login page
- [ ] Session token cleared
- [ ] Subsequent requests without token return 401

---

### Test Case 6.3: Session Timeout (Optional)

**Steps:**
1. Login successfully
2. Wait 30+ minutes without activity

**Expected Results:**
- [ ] Session expires automatically
- [ ] Next action requires re-login
- [ ] Redirected to login page

---

## Test Suite 7: Backend API Verification

### Test Case 7.1: POST /api/auth/signup

**Using cURL:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "role": "FARMER",
    "phone": "+919876543210"
  }'
```

**Expected Results:**
- [ ] HTTP 201 Created
- [ ] Response includes user data (without password)
- [ ] Database shows new user

---

### Test Case 7.2: POST /api/auth/login

**Using cURL:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Results:**
- [ ] HTTP 200 OK
- [ ] Response includes JWT token
- [ ] Token can be used for authenticated requests

---

### Test Case 7.3: Protected Route (Requires Auth)

**Using cURL with Token:**
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Expected Results:**
- [ ] HTTP 200 OK (if route exists)
- [ ] Returns user profile

---

### Test Case 7.4: Protected Route (Without Auth)

**Using cURL without Token:**
```bash
curl -X GET http://localhost:3001/api/users/profile
```

**Expected Results:**
- [ ] HTTP 401 Unauthorized
- [ ] Error message: "Access token required"

---

## Test Suite 8: Database Verification

### Test Case 8.1: User Creation

**Steps:**
1. Complete signup/login flow
2. Connect to PostgreSQL database

**Using psql:**
```bash
psql "postgresql://user:password@localhost:5432/farm_intellect?schema=public"
SELECT id, email, name, role, isVerified FROM users LIMIT 5;
```

**Expected Results:**
- [ ] New user appears in users table
- [ ] Email matches Aadhaar derivation (e.g., `aadhaar_123456789012@farmapp.local.io`)
- [ ] Role matches selected role (FARMER/MERCHANT/EXPERT)

---

### Test Case 8.2: Profile Creation

**Using psql:**
```bash
SELECT id, userId FROM farmer_profiles WHERE userId = '<USER_ID>';
```

**Expected Results:**
- [ ] If role is FARMER, entry exists in farmer_profiles
- [ ] Correct userId linked

---

### Test Case 8.3: OTP Code Storage

**Using psql:**
```bash
SELECT * FROM "OtpCode" ORDER BY createdAt DESC LIMIT 5;
```

**Expected Results:**
- [ ] OTP records exist for login/signup purposes
- [ ] Code is 6 digits
- [ ] expiresAt timestamp is 10 minutes from createdAt
- [ ] usedAt populated after verification

---

## Performance Tests

### Test Case 9.1: Login Response Time

**Steps:**
1. Open DevTools Network tab
2. Perform login
3. Check "api/auth/login" request duration

**Expected Results:**
- [ ] Login response < 1 second
- [ ] Redirected to dashboard smoothly

---

### Test Case 9.2: OTP Delivery Speed

**Steps:**
1. Send OTP
2. Check how long until OTP appears/is deliverable

**Expected Results:**
- [ ] OTP available within 2 seconds
- [ ] No network errors in console

---

## Security Tests (Optional)

### Test Case 10.1: SQL Injection Prevention

**Steps:**
1. Try to login with email: `test@example.com' OR '1'='1`
2. Observe error handling

**Expected Results:**
- [ ] No error in response (generic error message)
- [ ] Database not compromised
- [ ] Request logged for security audit

---

### Test Case 10.2: XSS Prevention

**Steps:**
1. Try to signup with name: `<script>alert('XSS')</script>`

**Expected Results:**
- [ ] Script tag not executed
- [ ] Input sanitized
- [ ] Displayed as plain text

---

## Completion Checklist

**All tests passed:**
- [ ] Signup working
- [ ] Login working
- [ ] Phone OTP functional
- [ ] Password reset complete
- [ ] Role-based redirects correct
- [ ] Session management proper
- [ ] Backend API responding
- [ ] Database storing data correctly
- [ ] No console errors
- [ ] No security vulnerabilities

**Status:** _______________

**Date:** _______________

**Tester Name:** _______________

**Notes:**
```
[Add any additional observations or issues found]
```

---

## Post-Testing Checklist

If all tests pass:
1. [ ] Commit changes to git
2. [ ] Update documentation
3. [ ] Deploy to staging environment
4. [ ] Run automated tests (if available)
5. [ ] Prepare for production deployment

If tests fail:
1. [ ] Document failure details
2. [ ] Check troubleshooting guide
3. [ ] Review backend logs
4. [ ] Check browser console for errors
5. [ ] Verify environment variables
6. [ ] Review recent code changes
