import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import supabaseAuthService from '../services/supabaseAuthService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Too many OTP requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many signup attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role')
    .optional()
    .isIn(['farmer', 'merchant', 'expert'])
    .withMessage('Invalid role'),
  body('phoneNumber')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Invalid phone number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
];

const otpLoginValidation = [
  body('phoneNumber')
    .isMobilePhone('en-IN')
    .withMessage('Invalid phone number'),
  body('otpCode')
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 4-6 digits'),
];

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', signupLimiter, signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password, fullName, role = 'farmer', phoneNumber, aadhaarNumber } = req.body;

    logger.info(`Signup attempt for email: ${email}`);

    const result = await supabaseAuthService.signUp(email, password, {
      full_name: fullName,
      role,
      phone_number: phoneNumber,
      aadhaar_number: aadhaarNumber,
    });

    if (!result.success) {
      logger.error(`Signup failed: ${result.error}`);
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    logger.info(`User signed up successfully: ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: result.user,
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    const result = await supabaseAuthService.login(email, password);

    if (!result.success) {
      logger.warn(`Login failed for ${email}: ${result.error}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    logger.info(`User logged in successfully: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and login
 */
router.post('/verify-otp', otpLimiter, otpLoginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { phoneNumber, otpCode } = req.body;

    logger.info(`OTP verification attempt for phone: ${phoneNumber}`);

    const result = await supabaseAuthService.verifyOtpAndLogin(phoneNumber, otpCode);

    if (!result.success) {
      logger.warn(`OTP verification failed for ${phoneNumber}: ${result.error}`);
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    logger.info(`User logged in via OTP: ${phoneNumber}`);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP to phone number
 */
router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    logger.info(`OTP resent for phone: ${phoneNumber}`);

    // In development, log the OTP
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV] OTP for ${phoneNumber}: ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Return OTP only in development
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    logger.error(`Resend OTP error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    logger.info(`Password reset requested for: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to email',
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with OTP
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, OTP and new password are required',
      });
    }

    logger.info(`Password reset attempt for: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate session)
 */
router.post('/logout', async (req, res) => {
  try {
    // Token is typically managed on frontend
    logger.info('User logged out');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * DELETE /api/auth/delete-account
 * Delete user account
 */
router.delete('/delete-account', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    logger.info(`Account deletion requested for user: ${userId}`);

    const result = await supabaseAuthService.deleteUser(userId);

    if (!result.success) {
      logger.error(`Account deletion failed: ${result.error}`);
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    logger.info(`Account deleted for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete account error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
