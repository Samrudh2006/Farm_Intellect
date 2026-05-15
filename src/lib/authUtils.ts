import { supabase } from '@/integrations/supabase/client';
import { profileApi } from './supabaseApi';

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian phone numbers)
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10;
};

// Aadhaar validation (12 digits)
export const validateAadhaar = (aadhaar: string): boolean => {
  const cleanAadhaar = aadhaar.replace(/\s/g, '');
  return /^\d{12}$/.test(cleanAadhaar);
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character');
  }
  
  return { valid: errors.length === 0, errors };
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>"']/g, '')
    .slice(0, 255);
};

// Sanitize phone input
export const sanitizePhoneInput = (phone: string): string => {
  return phone.replace(/\D/g, '').slice(-10);
};

// Safe sign out
export const safeSignOut = async (): Promise<{ success: boolean; error?: Error }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear sensitive data
    sessionStorage.clear();
    
    return { success: true };
  } catch (error) {
    console.error('[Auth] Sign out error:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Sign out failed') };
  }
};

// Update user password with validation
export const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
    console.error('[Auth] Password update error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to request password reset';
    console.error('[Auth] Password reset request error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Update user metadata safely
export const updateUserMetadata = async (
  userId: string,
  metadata: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Sanitize metadata
    const sanitizedMetadata: Record<string, any> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        sanitizedMetadata[key] = sanitizeInput(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitizedMetadata[key] = value;
      }
    }

    // Update via profile API
    await profileApi.updateProfile(userId, sanitizedMetadata);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
    console.error('[Auth] Metadata update error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Check if user session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
};

// Get current user safely
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('[Auth] Get current user error:', error);
    return null;
  }
};

// Refresh session
export const refreshSession = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      throw error;
    }

    if (!data.session) {
      return { success: false, error: 'No session available' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to refresh session';
    console.error('[Auth] Session refresh error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Rate limiting helper
const loginAttempts = new Map<string, { count: number; timestamp: number }>();

export const checkLoginAttempts = (identifier: string): { allowed: boolean; waitSeconds?: number } => {
  const key = `login_${identifier}`;
  const now = Date.now();
  const attempts = loginAttempts.get(key);

  if (!attempts) {
    loginAttempts.set(key, { count: 1, timestamp: now });
    return { allowed: true };
  }

  // Reset if more than 15 minutes have passed
  if (now - attempts.timestamp > 15 * 60 * 1000) {
    loginAttempts.set(key, { count: 1, timestamp: now });
    return { allowed: true };
  }

  // Allow 5 attempts per 15 minutes
  if (attempts.count >= 5) {
    const waitSeconds = Math.ceil((15 * 60 * 1000 - (now - attempts.timestamp)) / 1000);
    return { allowed: false, waitSeconds };
  }

  attempts.count++;
  return { allowed: true };
};

// Record login attempt for audit
export const recordLoginAttempt = async (
  email: string,
  success: boolean,
  ipAddress?: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Insert audit log
      await supabase.from('audit_logs').insert([
        {
          user_id: user.id,
          action: success ? 'login_success' : 'login_failed',
          entity_type: 'auth',
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
        },
      ]);
    }
  } catch (error) {
    console.error('[Auth] Failed to record login attempt:', error);
  }
};

// Check if email is already registered
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    return !!data && !error;
  } catch {
    return false;
  }
};

// Session timeout handler
let sessionTimeoutId: NodeJS.Timeout | null = null;

export const setSessionTimeout = (milliseconds: number = 30 * 60 * 1000) => {
  if (sessionTimeoutId) clearTimeout(sessionTimeoutId);

  sessionTimeoutId = setTimeout(async () => {
    await safeSignOut();
    window.location.href = '/login';
  }, milliseconds);
};

export const resetSessionTimeout = (milliseconds: number = 30 * 60 * 1000) => {
  setSessionTimeout(milliseconds);
};

// Clean up on unmount
export const clearSessionTimeout = () => {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
};
