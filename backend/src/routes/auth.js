import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { generateToken, hashPassword, comparePassword } from '../utils/auth.js';
import { sendOTP, verifyOTP } from '../utils/otp.js';
import { logActivity } from '../middleware/activity.js';
import { logger } from '../utils/logger.js';

const router = express.Router();


const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: 'Too many OTP requests. Please try again later.'
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: 'Too many password reset attempts. Please try again later.'
});


// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least 8 characters with uppercase, lowercase, number and special character'),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['FARMER', 'MERCHANT', 'EXPERT']),
  body('phone').optional().isMobilePhone()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Enhanced signup with OTP verification
router.post('/signup', signupValidation, logActivity, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, phone, location } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        phone,
        location
      }
    });

    await prisma.notificationPreference.create({
      data: { userId: user.id }
    });

    // Create role-specific profile
    if (role === 'FARMER') {
      await prisma.farmerProfile.create({
        data: { userId: user.id }
      });
    } else if (role === 'MERCHANT') {
      await prisma.merchantProfile.create({
        data: { userId: user.id }
      });
    } else if (role === 'EXPERT') {
      await prisma.expertProfile.create({
        data: { userId: user.id }
      });
    }

    // Send OTP for email verification
    if (email) {
      await sendOTP(user.id, email, 'EMAIL', 'signup');
    }

    // Send OTP for phone verification
    if (phone) {
      await sendOTP(user.id, phone, 'SMS', 'signup');
    }

    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User created successfully. Please verify your email and phone.',
      user: userWithoutPassword,
      requiresVerification: true
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced login with optional 2FA
router.post('/login', loginValidation, logActivity, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, otpCode } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        farmerProfile: true,
        merchantProfile: true,
        expertProfile: true
      }
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is required (for critical roles or sensitive actions)
    const requires2FA = user.role === 'ADMIN' || user.role === 'EXPERT';
    
    if (requires2FA && !otpCode) {
      // Send OTP
      await sendOTP(user.id, user.email, 'EMAIL', 'login');
      return res.status(200).json({
        requires2FA: true,
        message: 'OTP sent to your email'
      });
    }

    if (requires2FA && otpCode) {
      const otpValid = await verifyOTP(user.id, otpCode, 'login');
      if (!otpValid) {
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      }
    }

    const token = generateToken({ userId: user.id, role: user.role });
    const { password: _, ...userWithoutPassword } = user;

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const { userId, code, purpose } = req.body;

    if (!userId || !code || !purpose) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isValid = await verifyOTP(userId, code, purpose);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update verification status based on purpose
    if (purpose === 'signup') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          emailVerified: true // Assuming email OTP for signup
        }
      });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend OTP
router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { userId, type, purpose } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contact = type === 'EMAIL' ? user.email : user.phone;
    if (!contact) {
      return res.status(400).json({ error: `${type.toLowerCase()} not available` });
    }

    await sendOTP(userId, contact, type, purpose);

    res.json({ message: `OTP sent to your ${type.toLowerCase()}` });
  } catch (error) {
    logger.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request
router.post('/forgot-password', resetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal whether user exists
      return res.json({ message: 'If account exists, password reset instructions have been sent' });
    }

    await sendOTP(user.id, email, 'EMAIL', 'reset-password');

    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with OTP
router.post('/reset-password', resetLimiter, async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otpValid = await verifyOTP(user.id, otpCode, 'reset-password');
    if (!otpValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete account (requires re-authentication)
router.post('/delete-account', authenticate, resetLimiter, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password confirmation is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid password confirmation' });
    }

    const anonymizedEmail = `deleted_${user.id}_${Date.now()}@deleted.local`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: 'Deleted User',
        email: anonymizedEmail,
        phone: null,
        location: null,
        isVerified: false,
      }
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        action: 'ACCOUNT_DELETION_REQUEST',
        description: 'User account anonymized after password re-authentication',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        metadata: JSON.stringify({ at: new Date().toISOString() })
      }
    });

    res.clearCookie('session_token');
    return res.json({ message: 'Account anonymized successfully' });
  } catch (error) {
    logger.error('Delete account error:', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
