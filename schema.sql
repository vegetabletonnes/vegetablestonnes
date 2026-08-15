-- VegetableTonnes — Full database schema (Supabase PostgreSQL)
-- Run in Supabase SQL Editor for fresh setup.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables (clean reinstall)
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS buyer_profiles CASCADE;
DROP TABLE IF EXISTS farmer_profiles CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─── 1. Users ───────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'farmer', 'buyer')),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    gstin VARCHAR(50),
    pan VARCHAR(50),
    phone VARCHAR(50),
    location VARCHAR(255),
    farm_size VARCHAR(100),
    verified BOOLEAN DEFAULT false,
    buyer_id_ref VARCHAR(100),
    registration_status VARCHAR(50) DEFAULT 'pending'
        CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Products ────────────────────────────────────────────
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    grade VARCHAR(50),
    description TEXT,
    image TEXT,
    base_price NUMERIC NOT NULL CHECK (base_price > 0),
    unit VARCHAR(50) DEFAULT 'Ton',
    min_order NUMERIC DEFAULT 1,
    available_stock NUMERIC DEFAULT 0,
    origin VARCHAR(255),
    harvest_date DATE,
    shelf_life VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Inventory (public catalog / warehouse stock) ────────
CREATE TABLE inventory (
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

-- ─── 4. Auctions ────────────────────────────────────────────
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    base_price NUMERIC NOT NULL CHECK (base_price > 0),
    current_highest_bid NUMERIC DEFAULT 0,
    total_stock NUMERIC NOT NULL,
    available_stock NUMERIC NOT NULL,
    min_order NUMERIC DEFAULT 1,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Bids ────────────────────────────────────────────────
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    price_per_ton NUMERIC NOT NULL CHECK (price_per_ton > 0),
    total_value NUMERIC NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    destination TEXT,
    delivery_date DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. Orders ──────────────────────────────────────────────
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id),
    farmer_id UUID NOT NULL REFERENCES users(id),
    quantity NUMERIC NOT NULL,
    bid_price NUMERIC NOT NULL,
    total_value NUMERIC NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'accepted', 'payment_pending', 'shipped', 'delivered', 'cancelled')),
    vehicle_no VARCHAR(100),
    driver_phone VARCHAR(50),
    gate_pass_issued BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. Payments ────────────────────────────────────────────
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. Invoices ────────────────────────────────────────────
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. Notifications ───────────────────────────────────────
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. Buyer Profiles ─────────────────────────────────────
CREATE TABLE buyer_profiles (
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

-- ─── 11. Farmer Profiles ────────────────────────────────────
CREATE TABLE farmer_profiles (
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

-- ─── 12. Admin Logs ─────────────────────────────────────────
CREATE TABLE admin_logs (
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

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_inventory_commodity ON inventory(commodity);
CREATE INDEX idx_auctions_product ON auctions(product_id);
CREATE INDEX idx_auctions_farmer ON auctions(farmer_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_buyer ON bids(buyer_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_buyer_profiles_user ON buyer_profiles(user_id);
CREATE INDEX idx_farmer_profiles_user ON farmer_profiles(user_id);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_users_registration ON users(registration_status);

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on auctions" ON auctions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on bids" ON bids FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on buyer_profiles" ON buyer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on farmer_profiles" ON farmer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on admin_logs" ON admin_logs FOR ALL USING (true) WITH CHECK (true);

-- ─── updated_at trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_auctions_modtime BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bids_modtime BEFORE UPDATE ON bids FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notifications_modtime BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_buyer_profiles_modtime BEFORE UPDATE ON buyer_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_farmer_profiles_modtime BEFORE UPDATE ON farmer_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_admin_logs_modtime BEFORE UPDATE ON admin_logs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
