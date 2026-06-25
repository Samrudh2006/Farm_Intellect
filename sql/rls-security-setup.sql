-- Farm Intellect Security Layer: Row-Level Security Setup
-- This script implements RLS on all sensitive tables to ensure users can only access their own data

-- Enable RLS on user profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can only update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Enable RLS on consultations
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can only view their own consultations"
  ON consultations FOR SELECT
  USING (auth.uid() = farmer_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'expert'
  ));

CREATE POLICY "Farmers can only insert their own consultations"
  ON consultations FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can only update their own consultations"
  ON consultations FOR UPDATE
  USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

-- Enable RLS on crop recommendations
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view recommendations for their farms"
  ON crop_recommendations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM farms WHERE id = crop_recommendations.farm_id AND user_id = auth.uid()
  ));

-- Enable RLS on farms
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can only view their own farms"
  ON farms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can only insert their own farms"
  ON farms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can only update their own farms"
  ON farms FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable RLS on market prices
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view market prices (read-only)"
  ON market_prices FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert market prices"
  ON market_prices FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Audit trail table for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view audit logs for their own data"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
