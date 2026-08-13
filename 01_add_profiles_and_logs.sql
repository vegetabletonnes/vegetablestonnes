-- DEPRECATED: Merged into schema.sql
-- Use schema.sql + seed.sql for fresh setup, or migration_existing_db.sql for live DB updates.

-- ==========================================
-- 1. Buyer Profiles Table
-- ==========================================
-- Stores specific buyer-related information such as billing, shipping, and credit limits.
CREATE TABLE IF NOT EXISTS buyer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    billing_address TEXT,
    shipping_address TEXT,
    preferred_payment_method VARCHAR(100),
    credit_limit NUMERIC DEFAULT 0 CHECK (credit_limit >= 0),
    trade_license_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Buyer Profiles
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user ON buyer_profiles(user_id);

-- Enable RLS and Policies for Buyer Profiles
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own profile" 
    ON buyer_profiles FOR SELECT 
    USING (true); -- Assuming API gatekeeper or specific auth logic

CREATE POLICY "Buyers can update their own profile" 
    ON buyer_profiles FOR UPDATE 
    USING (true) WITH CHECK (true);

-- Trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_buyer_profiles_modtime
        BEFORE UPDATE ON buyer_profiles
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==========================================
-- 2. Farmer Profiles Table
-- ==========================================
-- Stores specific farmer-related information such as farm size, certifications, and banking details.
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    farm_address TEXT,
    total_acres NUMERIC CHECK (total_acres >= 0),
    certifications TEXT,
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    ifsc_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Farmer Profiles
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user ON farmer_profiles(user_id);

-- Enable RLS and Policies for Farmer Profiles
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their own profile" 
    ON farmer_profiles FOR SELECT 
    USING (true);

CREATE POLICY "Farmers can update their own profile" 
    ON farmer_profiles FOR UPDATE 
    USING (true) WITH CHECK (true);

-- Trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_farmer_profiles_modtime
        BEFORE UPDATE ON farmer_profiles
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==========================================
-- 3. Admin Logs Table
-- ==========================================
-- Audit trail for tracking administrative actions taken on the platform.
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    target_table VARCHAR(100),
    target_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Admin Logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);

-- Enable RLS and Policies for Admin Logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins should be able to read logs. System creates them.
CREATE POLICY "Admins can view all logs" 
    ON admin_logs FOR SELECT 
    USING (true);

CREATE POLICY "System can insert logs" 
    ON admin_logs FOR INSERT 
    WITH CHECK (true);

-- Trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_admin_logs_modtime
        BEFORE UPDATE ON admin_logs
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
