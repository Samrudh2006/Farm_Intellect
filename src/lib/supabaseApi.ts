import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions
type Profiles = Database['public']['Tables']['profiles']['Row'];
type Farms = Database['public']['Tables']['farms']['Row'];
type Fields = Database['public']['Tables']['fields']['Row'];
type Crops = Database['public']['Tables']['crops']['Row'];
type Advisories = Database['public']['Tables']['advisories']['Row'];
type Orders = Database['public']['Tables']['orders']['Row'];
type Consultations = Database['public']['Tables']['consultations']['Row'];
type Notifications = Database['public']['Tables']['notifications']['Row'];

// ============= PROFILE OPERATIONS =============

export const profileApi = {
  // Update user profile
  async updateProfile(userId: string, updates: Partial<Profiles>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get all users by role
  async getUsersByRole(role: 'farmer' | 'merchant' | 'expert' | 'admin') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update last login
  async updateLastLogin(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
  },
};

// ============= FARM OPERATIONS =============

export const farmApi = {
  // Create a new farm
  async createFarm(farmerId: string, farmData: Omit<Farms, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('farms')
      .insert([{ ...farmData, farmer_id: farmerId }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get all farms for a farmer
  async getFarmsByFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('farmer_id', farmerId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get farm details
  async getFarm(farmId: string) {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update farm
  async updateFarm(farmId: string, updates: Partial<Farms>) {
    const { data, error } = await supabase
      .from('farms')
      .update(updates)
      .eq('id', farmId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Delete farm
  async deleteFarm(farmId: string) {
    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('id', farmId);
    
    if (error) throw new Error(error.message);
  },
};

// ============= FIELD OPERATIONS =============

export const fieldApi = {
  // Create a new field
  async createField(farmId: string, fieldData: Omit<Fields, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('fields')
      .insert([{ ...fieldData, farm_id: farmId }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get all fields for a farm
  async getFieldsByFarm(farmId: string) {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('farm_id', farmId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get field details
  async getField(fieldId: string) {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('id', fieldId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update field
  async updateField(fieldId: string, updates: Partial<Fields>) {
    const { data, error } = await supabase
      .from('fields')
      .update(updates)
      .eq('id', fieldId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Delete field
  async deleteField(fieldId: string) {
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', fieldId);
    
    if (error) throw new Error(error.message);
  },
};

// ============= CROP OPERATIONS =============

export const cropApi = {
  // Create a new crop
  async createCrop(fieldId: string, cropData: Omit<Crops, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('crops')
      .insert([{ ...cropData, field_id: fieldId }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get all crops for a field
  async getCropsByField(fieldId: string) {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('field_id', fieldId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get crop details
  async getCrop(cropId: string) {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('id', cropId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update crop
  async updateCrop(cropId: string, updates: Partial<Crops>) {
    const { data, error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', cropId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Delete crop
  async deleteCrop(cropId: string) {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId);
    
    if (error) throw new Error(error.message);
  },
};

// ============= ADVISORY OPERATIONS =============

export const advisoryApi = {
  // Create advisory
  async createAdvisory(expertId: string, advisoryData: Omit<Advisories, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('advisories')
      .insert([{ ...advisoryData, created_by_expert_id: expertId }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get all advisories
  async getAllAdvisories() {
    const { data, error } = await supabase
      .from('advisories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get advisories by expert
  async getAdvisoriesByExpert(expertId: string) {
    const { data, error } = await supabase
      .from('advisories')
      .select('*')
      .eq('created_by_expert_id', expertId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get advisories by type
  async getAdvisoriesByType(type: string) {
    const { data, error } = await supabase
      .from('advisories')
      .select('*')
      .eq('advisory_type', type)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update advisory
  async updateAdvisory(advisoryId: string, updates: Partial<Advisories>) {
    const { data, error } = await supabase
      .from('advisories')
      .update(updates)
      .eq('id', advisoryId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};

// ============= ORDER OPERATIONS =============

export const orderApi = {
  // Create order
  async createOrder(merchantId: string, orderData: Omit<Orders, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{ ...orderData, merchant_id: merchantId }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get orders by merchant
  async getOrdersByMerchant(merchantId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get orders by farmer
  async getOrdersByFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update order
  async updateOrder(orderId: string, updates: Partial<Orders>) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};

// ============= CONSULTATION OPERATIONS =============

export const consultationApi = {
  // Create consultation
  async createConsultation(expertId: string, consultationData: Omit<Consultations, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('consultations')
      .insert([{ ...consultationData, expert_id: expertId }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get consultations by expert
  async getConsultationsByExpert(expertId: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('expert_id', expertId)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get consultations by farmer
  async getConsultationsByFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Update consultation
  async updateConsultation(consultationId: string, updates: Partial<Consultations>) {
    const { data, error } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', consultationId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
};

// ============= NOTIFICATION OPERATIONS =============

export const notificationApi = {
  // Create notification
  async createNotification(userId: string, notificationData: Omit<Notifications, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notificationData, user_id: userId }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Get notifications for user
  async getNotifications(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw new Error(error.message);
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw new Error(error.message);
  },
};
