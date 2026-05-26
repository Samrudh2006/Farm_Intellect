# API Testing Guide - Farm Intellect Auth System

## Updated Endpoints (No Email Required)

### 1. Signup with Aadhaar + Phone + Passkey
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "aadhaarNumber": "123456789012",
  "passkey": "MyPasskey123",
  "fullName": "Samrudh Singh",
  "location": {
    "state": "Punjab",
    "city": "Ludhiana"
  },
  "role": "farmer"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid-string",
    "email": "aadhaar_123456789012@farm-intellect.local",
    "user_metadata": {
      "full_name": "Samrudh Singh",
      "phone_number": "+919876543210",
      "aadhaar_number": "123456789012",
      "role": "farmer"
    }
  },
  "data": {
    "phoneNumber": "+919876543210",
    "aadhaarNumber": "123456789012",
    "fullName": "Samrudh Singh"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Validation failed or signup failed"
}
```

---

### 2. Login with Aadhaar + Phone + Passkey
**Endpoint:** `POST /api/auth/login-aadhaar`

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "aadhaarNumber": "123456789012",
  "passkey": "MyPasskey123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-string",
    "email": "aadhaar_123456789012@farm-intellect.local",
    "aud": "authenticated",
    "role": "authenticated",
    "email_confirmed_at": "2026-05-26T23:20:00Z",
    "user_metadata": {
      "full_name": "Samrudh Singh",
      "phone_number": "+919876543210",
      "aadhaar_number": "123456789012",
      "role": "farmer"
    },
    "identities": [],
    "created_at": "2026-05-26T23:20:00Z",
    "updated_at": "2026-05-26T23:20:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid Aadhaar number, phone, or passkey"
}
```

---

## Testing Steps

### Step 1: Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "aadhaarNumber": "123456789012",
    "passkey": "MyPasskey123",
    "fullName": "Test Farmer",
    "location": {"state": "Punjab", "city": "Ludhiana"},
    "role": "farmer"
  }'
```

**Expected:** 201 Created with user data

---

### Step 2: Login with same credentials
```bash
curl -X POST http://localhost:3001/api/auth/login-aadhaar \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "aadhaarNumber": "123456789012",
    "passkey": "MyPasskey123"
  }'
```

**Expected:** 200 OK with JWT token

---

### Step 3: Try login with wrong passkey
```bash
curl -X POST http://localhost:3001/api/auth/login-aadhaar \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "aadhaarNumber": "123456789012",
    "passkey": "WrongPasskey"
  }'
```

**Expected:** 401 Unauthorized

---

## Frontend Integration

The frontend form should POST to:
- **Signup:** `POST /api/auth/signup` with phoneNumber, aadhaarNumber, passkey, fullName, location
- **Login:** `POST /api/auth/login-aadhaar` with phoneNumber, aadhaarNumber, passkey

---

## What Changed

✅ Removed email validation requirement
✅ Added Aadhaar-based signup (creates internal email)
✅ Added Aadhaar-based login endpoint
✅ Passkey is now used as the password
✅ Phone number is required and validated
✅ Location is optional but supported

---

## Database Schema

User data is stored in Supabase with the following structure:

```
profiles table:
- id (UUID from auth)
- email (generated from Aadhaar)
- phone_number
- aadhaar_number (unique)
- full_name
- role (farmer, merchant, expert, admin)
- location (JSON)
- created_at
- updated_at
```

All data is protected by Row Level Security (RLS) policies.
