-- VegetableTonnes seed data
-- Run AFTER schema.sql in Supabase SQL Editor

-- ─── Admin (password: password) ─────────────────────────────
INSERT INTO users (id, email, password_hash, role, name, company, phone, verified, registration_status)
VALUES (
    '11111111-1111-4111-a111-111111111111',
    'vegetabletonnes@gmail.com',
    '$2a$10$C0MzcT3TXqYDYniaOWlTOO1.f8/nTdbkdrZe7a8OfZ3YbTTuTW/ry',
    'admin',
    'Admin User',
    'VegetableTonnes Platform',
    '+91 9876543210',
    true,
    'approved'
) ON CONFLICT (email) DO NOTHING;

-- ─── Farmers ──────────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, role, name, company, gstin, pan, phone, location, farm_size, verified, registration_status)
VALUES
(
    '22222222-2222-4222-a222-222222222222',
    'ravi@farm.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'farmer', 'Ravi Kumar', 'Ravi Agro Farms',
    '29AADCF1234E1ZV', 'AADCF1234E', '+91 9876543211', 'Kolar, Karnataka', '45 Acres', true, 'approved'
),
(
    '33333333-3333-4333-a333-333333333333',
    'suresh@farm.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'farmer', 'Suresh Patel', 'Patel Organics',
    '24AADCP5678F1ZV', 'AADCP5678F', '+91 9876543212', 'Anand, Gujarat', '60 Acres', true, 'approved'
) ON CONFLICT (email) DO NOTHING;

-- ─── Demo approved buyer (password: password) ───────────────
INSERT INTO users (id, email, password_hash, role, name, company, gstin, pan, phone, location, verified, buyer_id_ref, registration_status)
VALUES (
    '44444444-4444-4444-a444-444444444444',
    'buyer@demo.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'buyer', 'Ramesh Mehta', 'Apex Agri Foods Pvt Ltd',
    '29ABCDE1234F1ZH', 'ABCDE1234F', '+91 9876543213', 'APMC Yard, Yeshwanthpur, Bengaluru',
    true, 'VT-BUY-4521', 'approved'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO buyer_profiles (user_id) VALUES ('44444444-4444-4444-a444-444444444444')
ON CONFLICT (user_id) DO NOTHING;
INSERT INTO farmer_profiles (user_id) VALUES ('22222222-2222-4222-a222-222222222222')
ON CONFLICT (user_id) DO NOTHING;
INSERT INTO farmer_profiles (user_id) VALUES ('33333333-3333-4333-a333-333333333333')
ON CONFLICT (user_id) DO NOTHING;

-- ─── Default inventory (5 core commodities) ─────────────────
INSERT INTO inventory (id, commodity, variety, grade, description, warehouse, origin, base_price_per_ton, available_tons, total_quantity_tons, status, auction_status, is_default)
VALUES
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
ON CONFLICT (id) DO NOTHING;

-- ─── Products (for auctions) ────────────────────────────────
INSERT INTO products (id, farmer_id, name, category, variety, grade, description, image, base_price, unit, min_order, available_stock, origin, active)
VALUES
(
    '55555555-5555-4555-a555-555555555551',
    '22222222-2222-4222-a222-222222222222',
    'Fresh Tomatoes', 'Tomatoes', 'Red Hybrid F1', 'A',
    'Farm-Fresh. Vibrant. Full of Flavor. Carefully selected premium tomatoes.',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    18500, 'Ton', 2, 180, 'Kolar, Karnataka', true
),
(
    '55555555-5555-4555-a555-555555555552',
    '33333333-3333-4333-a333-333333333333',
    'Juicy Watermelons', 'Melons', 'Summer Select', 'A',
    'Naturally Sweet. Perfectly Refreshing. Fresh, juicy watermelons.',
    'https://images.unsplash.com/photo-1587049352846-4a222e784822?auto=format&fit=crop&w=800&q=80',
    12000, 'Ton', 3, 200, 'Anantapur, Andhra Pradesh', true
) ON CONFLICT (id) DO NOTHING;

-- ─── Auctions ───────────────────────────────────────────────
INSERT INTO auctions (id, product_id, farmer_id, base_price, current_highest_bid, total_stock, available_stock, min_order, start_time, end_time, status, description)
VALUES
(
    '66666666-6666-4666-a666-666666666661',
    '55555555-5555-4555-a555-555555555551',
    '22222222-2222-4222-a222-222222222222',
    18500, 19200, 180, 135, 2,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', 'active',
    'Premium fresh tomatoes — live auction'
),
(
    '66666666-6666-4666-a666-666666666662',
    '55555555-5555-4555-a555-555555555552',
    '33333333-3333-4333-a333-333333333333',
    12000, 12500, 200, 170, 3,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', 'active',
    'Juicy watermelons — bulk wholesale'
) ON CONFLICT (id) DO NOTHING;

-- ─── Sample bid & order ─────────────────────────────────────
INSERT INTO bids (id, auction_id, buyer_id, quantity, price_per_ton, total_value, status, destination)
VALUES (
    '77777777-7777-4777-a777-777777777772',
    '66666666-6666-4666-a666-666666666662',
    '44444444-4444-4444-a444-444444444444',
    50, 12500, 625000, 'approved', 'Bengaluru APMC Yard'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, bid_id, auction_id, buyer_id, farmer_id, quantity, bid_price, total_value, status)
VALUES (
    '88888888-8888-4888-a888-888888888881',
    '77777777-7777-4777-a777-777777777772',
    '66666666-6666-4666-a666-666666666662',
    '44444444-4444-4444-a444-444444444444',
    '33333333-3333-4333-a333-333333333333',
    50, 12500, 625000, 'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, order_id, amount, status, payment_method)
VALUES (
    '99999999-9999-4999-a999-999999999991',
    '88888888-8888-4888-a888-888888888881',
    625000, 'pending', 'Bank Transfer'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, user_id, title, message, type, is_read)
VALUES (
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    '44444444-4444-4444-a444-444444444444',
    'Bid Approved',
    'Your bid for 50 Tons of Watermelons has been approved.',
    'bid_update', false
) ON CONFLICT (id) DO NOTHING;
