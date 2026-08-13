-- Migration for EXISTING Supabase databases (run if you already ran old schema.sql)
-- Safe to run multiple times — uses IF NOT EXISTS / conditional adds

-- Users: registration workflow
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_status VARCHAR(50) DEFAULT 'approved';
UPDATE users SET registration_status = 'approved' WHERE registration_status IS NULL;
UPDATE users SET registration_status = 'approved' WHERE verified = true AND registration_status = 'pending';

-- Bids: extra columns
ALTER TABLE bids ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Notifications: metadata
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(50) PRIMARY KEY,
    commodity VARCHAR(255) NOT NULL,
    variety VARCHAR(255),
    grade VARCHAR(50),
    description TEXT,
    warehouse VARCHAR(255),
    origin VARCHAR(255),
    base_price_per_ton NUMERIC DEFAULT 0,
    available_tons NUMERIC DEFAULT 0,
    total_quantity_tons NUMERIC DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available',
    auction_status VARCHAR(50) DEFAULT 'upcoming',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow ALL on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Buyer / farmer profiles
CREATE TABLE IF NOT EXISTS buyer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    billing_address TEXT,
    shipping_address TEXT,
    preferred_payment_method VARCHAR(100),
    credit_limit NUMERIC DEFAULT 0,
    trade_license_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    farm_address TEXT,
    total_acres NUMERIC,
    certifications TEXT,
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(100),
    ifsc_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    target_table VARCHAR(100),
    target_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default inventory if empty
INSERT INTO inventory (id, commodity, variety, grade, description, warehouse, origin, base_price_per_ton, available_tons, total_quantity_tons, status, auction_status, is_default)
SELECT * FROM (VALUES
  ('INV-TOMATO', 'Fresh Tomatoes', 'Farm-Fresh Premium', 'A',
   'Farm-Fresh. Vibrant. Full of Flavor. Carefully selected premium tomatoes, delivered fresh for quality you can trust.',
   'Kolar Cold Storage Hub', 'Kolar, Karnataka', 18500, 120, 150, 'available', 'active', true),
  ('INV-MELON-W', 'Juicy Watermelons', 'Summer Select', 'A',
   'Naturally Sweet. Perfectly Refreshing. Fresh, juicy watermelons sourced from quality farms and supplied with care.',
   'Anantapur Distribution Yard', 'Anantapur, Andhra Pradesh', 12000, 200, 250, 'available', 'active', true),
  ('INV-MELON-M', 'Premium Muskmelons', 'Golden Aroma', 'A',
   'Sweet Aroma. Rich Taste. Naturally Fresh. Handpicked muskmelons offering exceptional flavor, freshness, and quality.',
   'Nashik Agri Warehouse', 'Nashik, Maharashtra', 14000, 90, 110, 'available', 'upcoming', true),
  ('INV-MANGO', 'Finest Mangoes', 'Alphonso Seasonal', 'S (Super)',
   'Naturally Sweet. Rich in Flavor. Premium seasonal mangoes, carefully sourced for an authentic taste of freshness.',
   'Ratnagiri Export Zone', 'Ratnagiri, Maharashtra', 45000, 60, 80, 'available', 'active', true),
  ('INV-GROUND', 'Quality Groundnuts', 'Bold Grade', 'A',
   'Naturally Grown. Carefully Selected. High-quality groundnuts, professionally graded for freshness, purity, and consistent quality.',
   'Guntur Trading Hub', 'Guntur, Andhra Pradesh', 9500, 300, 400, 'available', 'active', true)
) AS v(id, commodity, variety, grade, description, warehouse, origin, base_price_per_ton, available_tons, total_quantity_tons, status, auction_status, is_default)
WHERE NOT EXISTS (SELECT 1 FROM inventory LIMIT 1);
