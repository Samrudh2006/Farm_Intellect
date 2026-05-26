import { logger } from './logger.js';

// Simple OTP generator for testing
function generateOTP(length = 6) {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
}

// Store OTPs in memory for testing (in production, use Supabase edge functions)
const otpStore = new Map();

/**
 * Send OTP via email or SMS
 * For testing, OTP is logged to console
 */
export const sendOTP = async (userId, contact, type, purpose) => {
  try {
    const code = generateOTP(6);
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Store OTP in memory
    const otpKey = `${type}:${contact}`;
    otpStore.set(otpKey, {
      code,
      expiresAt,
      verified: false,
    });

    logger.info(`[TESTING] OTP for ${contact}: ${code} (expires in ${expiryMinutes} minutes)`);
    console.log(`\n[TEST OTP] ${type.toUpperCase()}: ${contact}\nCode: ${code}\n`);

    return {
      success: true,
      message: 'OTP sent successfully',
      otp: code, // Return OTP for testing
    };
  } catch (error) {
    logger.error(`Failed to send OTP: ${error.message}`);
    return {
      success: false,
      error: 'Failed to send OTP',
    };
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (contact, code, type) => {
  try {
    const otpKey = `${type}:${contact}`;
    const otpRecord = otpStore.get(otpKey);

    if (!otpRecord) {
      return {
        success: false,
        error: 'OTP not found or expired',
      };
    }

    if (new Date() > otpRecord.expiresAt) {
      otpStore.delete(otpKey);
      return {
        success: false,
        error: 'OTP has expired',
      };
    }

    if (otpRecord.code !== code) {
      return {
        success: false,
        error: 'Invalid OTP',
      };
    }

    // Mark OTP as verified
    otpRecord.verified = true;

    logger.info(`OTP verified for ${contact}`);
    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
    return {
      success: false,
      error: 'OTP verification failed',
    };
  }
};

export default {
  sendOTP,
  verifyOTP,
};
