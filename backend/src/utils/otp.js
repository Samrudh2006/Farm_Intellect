import nodemailer from 'nodemailer';
import twilio from 'twilio';
import prisma from '../config/database.js';
import { generateOTP } from './auth.js';
import { logger } from './logger.js';

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendOTP = async (userId, contact, type, purpose) => {
  try {
    // Generate OTP
    const code = generateOTP(6);
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save OTP to database
    await prisma.otpCode.create({
      data: {
        userId,
        code,
        type,
        purpose,
        expiresAt
      }
    });

    // Send OTP
    if (type === 'EMAIL') {
      await sendEmailOTP(contact, code, purpose);
    } else if (type === 'SMS') {
      await sendSMSOTP(contact, code, purpose);
    }

    logger.info(`OTP sent to ${contact} for ${purpose}`);
  } catch (error) {
    logger.error('Send OTP error:', error);
    throw new Error('Failed to send OTP');
  }
};

export const verifyOTP = async (userId, code, purpose) => {
  try {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        purpose,
        usedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!otpRecord) {
      return false;
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() }
    });

    return true;
  } catch (error) {
    logger.error('Verify OTP error:', error);
    return false;
  }
};

const sendEmailOTP = async (email, code, purpose) => {
  const subject = getEmailSubject(purpose);
  const text = getEmailText(code, purpose);

  await emailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html: getEmailHTML(code, purpose)
  });
};

const sendSMSOTP = async (phone, code, purpose) => {
  if (!twilioClient) {
    logger.warn('Twilio not configured, skipping SMS OTP');
    return;
  }

  const message = getSMSMessage(code, purpose);

  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
};

const getEmailSubject = (purpose) => {
  const subjects = {
    'signup': 'Verify your Farm Intellect account',
    'login': 'Your login verification code',
    'reset-password': 'Password reset verification',
    'critical-action': 'Security verification required'
  };
  return subjects[purpose] || 'Verification Code';
};

const getEmailText = (code, purpose) => {
  const messages = {
    'signup': `Welcome to Farm Intellect! Your verification code is: ${code}`,
    'login': `Your login verification code is: ${code}`,
    'reset-password': `Your password reset code is: ${code}`,
    'critical-action': `Your security verification code is: ${code}`
  };
  return messages[purpose] || `Your verification code is: ${code}`;
};

const getEmailHTML = (code, purpose) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .code { font-size: 24px; font-weight: bold; color: #16a34a; text-align: center; padding: 20px; background: #f0f9f0; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Farm Intellect</h1>
        </div>
        <div class="content">
          <h2>${getEmailSubject(purpose)}</h2>
          <p>${getEmailText(code, purpose)}</p>
          <div class="code">${code}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 Farm Intellect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getSMSMessage = (code, purpose) => {
  const messages = {
    'signup': `Farm Intellect: Your verification code is ${code}`,
    'login': `Farm Intellect: Your login code is ${code}`,
    'reset-password': `Farm Intellect: Your password reset code is ${code}`,
    'critical-action': `Farm Intellect: Your security code is ${code}`
  };
  return messages[purpose] || `Farm Intellect: Your verification code is ${code}`;
};