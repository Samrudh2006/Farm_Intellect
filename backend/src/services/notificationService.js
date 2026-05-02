import admin from 'firebase-admin';
import twilio from 'twilio';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

const getFirebaseApp = () => {
  if (!process.env.FCM_PROJECT_ID || !process.env.FCM_CLIENT_EMAIL || !process.env.FCM_PRIVATE_KEY) {
    return null;
  }

  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FCM_PROJECT_ID,
      clientEmail: process.env.FCM_CLIENT_EMAIL,
      privateKey: process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
};

const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

export const ensureNotificationPreference = async (userId) => {
  const existing = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.notificationPreference.create({ data: { userId } });
};

export const registerDeviceToken = async ({ userId, token, platform }) =>
  prisma.deviceToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { userId, token, platform },
  });

const createInAppNotification = async ({ userId, title, message, type, data }) =>
  prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      data: data ? JSON.stringify(data) : null,
    },
  });

const sendPushNotification = async ({ userId, title, message, data }) => {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return;
  const tokens = await prisma.deviceToken.findMany({ where: { userId } });
  if (tokens.length === 0) return;

  const payload = {
    notification: { title, body: message },
    data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
    tokens: tokens.map((entry) => entry.token),
  };

  try {
    await admin.messaging().sendEachForMulticast(payload);
  } catch (error) {
    logger.warn('FCM push failed', { error });
  }
};

const sendSmsNotification = async ({ phone, message }) => {
  const client = getTwilioClient();
  if (!client || !phone) return;
  try {
    await client.messages.create({
      to: phone,
      from: process.env.TWILIO_MESSAGING_SERVICE_SID ? undefined : process.env.TWILIO_SMS_FROM,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      body: message,
    });
  } catch (error) {
    logger.warn('SMS send failed', { error });
  }
};

const sendWhatsAppNotification = async ({ phone, message }) => {
  const client = getTwilioClient();
  if (!client || !phone || !process.env.TWILIO_WHATSAPP_FROM) return;
  try {
    await client.messages.create({
      to: `whatsapp:${phone}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      body: message,
    });
  } catch (error) {
    logger.warn('WhatsApp send failed', { error });
  }
};

export const sendNotificationToUser = async ({ userId, title, message, type = 'INFO', data }) => {
  const preference = await ensureNotificationPreference(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  let inAppNotification = null;

  if (preference.inApp) {
    inAppNotification = await createInAppNotification({ userId, title, message, type, data });
  }

  if (preference.push) {
    await sendPushNotification({ userId, title, message, data });
  }

  if (preference.sms) {
    await sendSmsNotification({ phone: user?.phone, message });
  }

  if (preference.whatsapp) {
    await sendWhatsAppNotification({ phone: user?.phone, message });
  }

  return inAppNotification;
};

export const sendNotificationToRole = async ({ role, title, message, type = 'INFO', data }) => {
  const users = await prisma.user.findMany({ where: { role } });
  for (const user of users) {
    await sendNotificationToUser({ userId: user.id, title, message, type, data });
  }
};
