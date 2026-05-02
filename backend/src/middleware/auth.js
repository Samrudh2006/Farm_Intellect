import crypto from 'crypto';
import { hashPassword, verifyToken } from '../utils/auth.js';
import prisma from '../config/database.js';
import { hasSupabaseAuthConfig, supabaseAuthClient } from '../config/supabase.js';

const userInclude = {
  farmerProfile: true,
  merchantProfile: true,
  expertProfile: true,
};

const toAppRole = (value) => {
  const normalized = String(value || 'farmer').toUpperCase();
  return ['FARMER', 'MERCHANT', 'EXPERT', 'ADMIN'].includes(normalized) ? normalized : 'FARMER';
};

const findUserById = async (id) => prisma.user.findUnique({
  where: { id },
  include: userInclude,
});

const findOrProvisionSupabaseUser = async (supabaseUser) => {
  if (!supabaseUser?.email) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
    include: userInclude,
  });

  if (existingUser) {
    return existingUser;
  }

  const metadata = supabaseUser.user_metadata || {};
  const role = toAppRole(metadata.role);
  const generatedPassword = await hashPassword(`supabase-${crypto.randomUUID()}`);

    return prisma.user.create({
      data: {
        email: supabaseUser.email,
        password: generatedPassword,
        name: metadata.display_name || metadata.name || supabaseUser.email.split('@')[0],
        phone: metadata.phone || null,
        location: metadata.location || null,
        role,
        isVerified: Boolean(supabaseUser.email_confirmed_at),
        emailVerified: Boolean(supabaseUser.email_confirmed_at),
        phoneVerified: Boolean(supabaseUser.phone_confirmed_at),
        notificationPreference: { create: {} },
        ...(role === 'FARMER' ? { farmerProfile: { create: {} } } : {}),
        ...(role === 'MERCHANT' ? { merchantProfile: { create: {} } } : {}),
        ...(role === 'EXPERT' ? { expertProfile: { create: {} } } : {}),
      },
      include: userInclude,
    });
};

export const resolveAuthenticatedUser = async (token) => {
  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.userId);
    if (user) {
      return user;
    }
  } catch {
    // Fall through to Supabase token resolution
  }

  if (!hasSupabaseAuthConfig || !supabaseAuthClient) {
    return null;
  }

  const { data, error } = await supabaseAuthClient.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return findOrProvisionSupabaseUser(data.user);
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const user = await resolveAuthenticatedUser(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};
