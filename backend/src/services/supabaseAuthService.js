import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL_LOCAL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseAuthService {
  /**
   * Sign up a new user
   */
  async signUp(email, password, userData = {}) {
    try {
      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userData,
      });

      if (authError) {
        throw new Error(`Auth signup failed: ${authError.message}`);
      }

      // Create user profile in public.profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: userData.full_name || '',
            role: userData.role || 'farmer',
            aadhaar_number: userData.aadhaar_number || null,
            phone_number: userData.phone_number || null,
          },
        ])
        .select()
        .single();

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          ...profile,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Login user and return JWT token
   */
  async login(email, password) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(`Login failed: ${authError.message}`);
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        throw new Error(`Profile fetch failed: ${profileError.message}`);
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: authData.user.id,
          email: authData.user.email,
          role: profile.role,
        },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        token,
        user: profile,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify OTP and login user
   */
  async verifyOtpAndLogin(phoneNumber, otpCode) {
    try {
      // Check if OTP is valid
      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('otp_code', otpCode)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        throw new Error('Invalid or expired OTP');
      }

      // Find or create user by phone number
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      let userId;
      let user;

      if (existingUser) {
        userId = existingUser.id;
        user = existingUser;
      } else {
        // Create new user via auth
        const tempPassword = Math.random().toString(36).slice(-12);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: `phone_${phoneNumber}_${Date.now()}@farm-intellect.local`,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { phone_number: phoneNumber },
        });

        if (authError) {
          throw new Error(`User creation failed: ${authError.message}`);
        }

        // Create profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              phone_number: phoneNumber,
              phone_verified_at: new Date().toISOString(),
              role: 'farmer',
            },
          ])
          .select()
          .single();

        if (profileError) {
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        userId = authData.user.id;
        user = newProfile;
      }

      // Mark OTP as verified
      await supabase
        .from('otp_codes')
        .update({ is_verified: true })
        .eq('id', otpData.id);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        token,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(`User fetch failed: ${error.message}`);
      }

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
      return { success: true, user: decoded };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token',
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId) {
    try {
      // Delete from profiles (will cascade to related tables)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw new Error(`Profile deletion failed: ${profileError.message}`);
      }

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        throw new Error(`Auth deletion failed: ${authError.message}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new SupabaseAuthService();
