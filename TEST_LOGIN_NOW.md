# Test Login & Signup Now! 🚀

## Quick Start

Both servers are running:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Database**: Supabase PostgreSQL ✅

## Test Scenarios

### Scenario 1: Aadhaar-Based Signup (Recommended)

1. Go to http://localhost:5173
2. Click **"Sign Up"**
3. Select **"Sign up with Aadhaar"**
4. Fill in:
   - Aadhaar Number: `123456789012`
   - Full Name: Any name
   - Email: Any valid email
   - Phone: Any 10-digit number
   - Select Role: Farmer / Merchant / Expert / Admin
5. Click **"Create Passkey"** (use biometric or PIN)
6. Set Passkey: `Test@123` (or your own)
7. Click **"Complete Signup"**
8. ✅ You should be redirected to your role-based dashboard

### Scenario 2: Phone OTP Login

1. Go to http://localhost:5173
2. Click **"Login"**
3. Select **"Login with Phone OTP"**
4. Enter Phone: `9876543210`
5. Click **"Send OTP"**
6. Check console output (in dev, OTP shows in terminal)
7. Copy OTP and paste in the app
8. Click **"Verify OTP"**
9. ✅ You should be logged in

### Scenario 3: Password Reset

1. Go to http://localhost:5173
2. Click **"Forgot Password?"**
3. Enter Email: (your signup email)
4. Click **"Send Reset Link"**
5. Check terminal for OTP
6. Enter OTP code
7. Set new password
8. Click **"Reset Password"**
9. Login with new password

## What Happens Behind the Scenes

### When You Sign Up:
1. Frontend validates input
2. Sends request to Backend: `POST /api/auth/signup`
3. Backend creates user in Supabase Auth
4. Backend inserts profile in `public.profiles` table
5. Backend creates role-specific profile (farmer_profiles, merchant_profiles, etc.)
6. Database creates audit log entry
7. JWT token generated and returned
8. Frontend stores token in secure storage
9. Frontend redirects to dashboard

### When You Log In:
1. Frontend validates credentials
2. Sends request to Backend: `POST /api/auth/login`
3. Backend verifies password with bcrypt
4. Backend generates JWT token
5. Backend logs device/login info
6. Frontend stores token
7. Frontend fetches user profile from Supabase
8. Frontend redirects to dashboard

### Database Structure:
```
Supabase Auth (Built-in)
    ↓
    └── Creates user in auth.users table

Your App
    ↓
    ├── profiles table (main user data)
    │
    ├── farmer_profiles (farmer-specific)
    │
    ├── merchant_profiles (merchant-specific)
    │
    ├── expert_profiles (expert-specific)
    │
    ├── otp_codes (SMS/Email OTPs)
    │
    ├── audit_logs (security logs)
    │
    └── devices (device tracking)
```

## Expected Results

### Successful Signup:
- ✅ User created in Supabase Auth
- ✅ Profile created in `profiles` table
- ✅ Role-specific profile created
- ✅ JWT token generated
- ✅ Redirected to dashboard
- ✅ User can see their role in dashboard

### Successful Login:
- ✅ JWT token obtained
- ✅ User profile loaded
- ✅ Dashboard displays correct role
- ✅ Can see personalized content

### OTP Verification:
- ✅ OTP stored in `otp_codes` table
- ✅ OTP has expiration time
- ✅ Can verify and complete login
- ✅ Device logged in audit trail

## Verify in Database

To check if signup worked, you can:

1. **Check Supabase Console** (online)
   - Go to Supabase dashboard
   - View `profiles` table
   - Should see your new user

2. **Check Backend Logs**
   - Check `npm run dev` output
   - Look for "User created successfully"

3. **Check Frontend Logs**
   - Open browser DevTools (F12)
   - Check Console tab
   - Look for "Signup successful"

## API Testing (Advanced)

You can test directly with curl:

### Test Signup:
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "fullName": "Test User",
    "phoneNumber": "9876543210",
    "aadhaarNumber": "123456789012",
    "role": "farmer"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### Response Format:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "farmer"
  }
}
```

## Troubleshooting

### "Cannot reach backend"
- Check backend is running: `npm run dev` in backend/
- Check port 3001 is open
- Check CORS is enabled

### "Database connection failed"
- Verify Supabase integration is connected
- Check environment variables
- Ensure DATABASE_URL_LOCAL is set

### "Invalid JWT"
- Token might be expired (7 days)
- Try logging in again
- Clear browser storage and refresh

### "OTP not received"
- In development, check terminal output
- Email/SMS not configured in dev
- Production needs SMTP/Twilio setup

### "User already exists"
- That email/phone is already used
- Try different credentials
- Or check your signup records

## Next Steps

1. ✅ **Test signup** - Try Aadhaar signup
2. ✅ **Test login** - Try login with created account
3. ✅ **Check database** - Verify data in Supabase
4. ✅ **Test OTP** - Try phone OTP flow
5. ✅ **Test roles** - Create users with different roles
6. 🔜 **Production setup** - Configure real SMTP/SMS
7. 🔜 **Deploy** - Deploy to production

---

## Still Need Help?

- Check `AUTH_IMPLEMENTATION_GUIDE.md` for detailed setup
- Check `AUTH_TEST_CHECKLIST.md` for comprehensive testing
- Check `BACKEND_SETUP_COMPLETE.md` for system overview

**Status**: 🟢 Ready to test!
