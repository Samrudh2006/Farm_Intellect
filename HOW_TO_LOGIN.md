# How to Login to Farm Intellect 65

## Quick Start - First Time Users

### Step 1: Sign Up First
The app requires you to **Sign Up** before you can **Log In**. This is normal!

1. Open the app and you'll see the Login page
2. Look for the **"Don't have an account? Sign Up"** link
3. Click to switch to Sign Up mode

### Step 2: Create Your Account

Fill in the Sign Up form with:

```
Aadhaar Number: 123456789012 (any 12-digit number for testing)
Passkey: MySecurePass123 (any password)
Confirm Passkey: MySecurePass123
Name: Your Name (optional)
```

### Step 3: Select Your Role

Choose one of these roles:
- **Farmer** - View farms, market prices, recommendations
- **Merchant** - Manage listings and sales
- **Expert** - Advanced features and predictions
- **Admin** - System administration

### Step 4: Signup

Click "Sign Up" to create your account. You'll get a confirmation message.

### Step 5: Now You Can Login

Once signed up, click "Already have an account? Login" to switch back to Login mode, then use the same credentials:

```
Aadhaar Number: 123456789012
Passkey: MySecurePass123
```

---

## Test Accounts

You can also use these test credentials (make sure to sign up with them first):

### Farmer Account
```
Aadhaar: 111111111111
Passkey: FarmerPass123
Role: Farmer
```

### Merchant Account
```
Aadhaar: 222222222222
Passkey: MerchantPass456
Role: Merchant
```

### Expert Account
```
Aadhaar: 333333333333
Passkey: ExpertPass789
Role: Expert
```

### Admin Account
```
Aadhaar: 444444444444
Passkey: AdminPass000
Role: Admin
```

---

## Phone/OTP Login (Alternative)

You can also login using a phone number with OTP:

1. Click "Login with Phone"
2. Enter any 10-digit phone number
3. Click "Send OTP"
4. You'll see a test OTP code displayed (since email/SMS is not enabled in this environment)
5. Enter the OTP code to login

---

## Biometric Login (Optional)

After signing up, you can register biometric login:

1. During or after signup, click "Register Fingerprint" or "Register Face ID" (if supported)
2. Your biometric will be stored securely on your device
3. Next time, just tap the biometric button to login instantly

---

## Troubleshooting

### "Invalid Credentials" Error
- Make sure you've SIGNED UP first before trying to LOGIN
- Check that Aadhaar is 12 digits
- Make sure you're using the exact same credentials you signed up with
- Passkey is case-sensitive

### "Rate Limited" Error
- Too many failed attempts
- Wait a few minutes and try again
- Each account has 5 login attempts before being temporarily locked

### "Something Went Wrong"
- Check your internet connection
- Make sure Supabase is configured correctly
- Check the browser console (F12) for detailed error messages

---

## How It Works

1. **Sign Up**: Creates a new account with Aadhaar + Passkey
2. **Login**: Uses the same credentials to access your account
3. **Profile Creation**: After signup, your profile is automatically created
4. **Role-Based Access**: Your dashboard changes based on your role
   - Farmers see farm data and market info
   - Merchants see listings and sales
   - Experts see advanced features
   - Admins see system admin panels

---

## Security Notes

- Your credentials are encrypted with Supabase Auth
- Passwords are never stored in plain text
- Biometric data is stored only on your device
- OTPs expire after 5 minutes
- Login attempts are logged for security

---

## Next Steps

After login, you'll be redirected to your dashboard:
- **Farmer**: `/farmer/dashboard` 
- **Merchant**: `/merchant/dashboard`
- **Expert**: `/expert/dashboard`
- **Admin**: `/admin/dashboard`

Enjoy using Farm Intellect 65! 🌾
