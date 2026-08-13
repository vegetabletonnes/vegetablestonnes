-- Seed Users (Admin, Farmers, Buyers)
-- Using strictly valid UUIDs

-- 1. Insert Admin
INSERT INTO users (id, email, password_hash, role, name, company, phone, verified)
VALUES (
    '11111111-1111-4111-a111-111111111111',
    'admin@vegetabletonnes.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'Admin User',
    'VegetableTonnes Platform',
    '+91 9876543210',
    true
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert Farmers
INSERT INTO users (id, email, password_hash, role, name, company, gstin, pan, phone, location, farm_size, verified)
VALUES 
(
    '22222222-2222-4222-a222-222222222222',
    'ravi@farm.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'farmer',
    'Ravi Kumar',
    'Ravi Agro Farms',
    '29AADCF1234E1ZV',
    'AADCF1234E',
    '+91 9876543211',
    'Kolar, Karnataka',
    '45 Acres',
    true
),
(
    '33333333-3333-4333-a333-333333333333',
    'suresh@farm.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'farmer',
    'Suresh Patel',
    'Patel Organics',
    '24AADCP5678F1ZV',
    'AADCP5678F',
    '+91 9876543212',
    'Anand, Gujarat',
    '60 Acres',
    true
) ON CONFLICT (email) DO NOTHING;

-- 3. Insert Buyers
INSERT INTO users (id, email, password_hash, role, name, company, gstin, pan, phone, location, verified, buyer_id_ref)
VALUES 
(
    '44444444-4444-4444-a444-444444444444',
    'buyer@demo.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'buyer',
    'Ramesh Mehta',
    'Apex Agri Foods Pvt Ltd',
    '29ABCDE1234F1ZH',
    'ABCDE1234F',
    '+91 9876543213',
    'APMC Yard, Yeshwanthpur, Bengaluru',
    true,
    'VT-BUY-4521'
) ON CONFLICT (email) DO NOTHING;

-- Seed Products
INSERT INTO products (id, farmer_id, name, category, variety, grade, description, image, base_price, unit, min_order, available_stock, origin, harvest_date, shelf_life, active)
VALUES 
(
    '55555555-5555-4555-a555-555555555551',
    '22222222-2222-4222-a222-222222222222',
    'Red Hybrid Tomatoes',
    'Tomatoes',
    'Red Hybrid F1',
    'Grade A',
    'Firm, sorted, uniform red tomatoes. 50-60mm diameter.',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    18500,
    'Ton',
    2,
    180,
    'Kolar, Karnataka',
    '2026-08-01',
    '7-10 days',
    true
),
(
    '55555555-5555-4555-a555-555555555552',
    '33333333-3333-4333-a333-333333333333',
    'Jyoti Cold-Storage Potatoes',
    'Potatoes',
    'Jyoti',
    'Grade A',
    'Sugar-free grade potatoes, 45mm+ size.',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    15000,
    'Ton',
    3,
    320,
    'Anand, Gujarat',
    '2026-07-15',
    '30-45 days',
    true
) ON CONFLICT (id) DO NOTHING;

-- Seed Auctions
INSERT INTO auctions (id, product_id, farmer_id, base_price, current_highest_bid, total_stock, available_stock, min_order, start_time, end_time, status, description)
VALUES 
(
    '66666666-6666-4666-a666-666666666661',
    '55555555-5555-4555-a555-555555555551',
    '22222222-2222-4222-a222-222222222222',
    18500,
    19200,
    180,
    135,
    2,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '1 day',
    'active',
    'Firm, sorted, uniform red tomatoes. 50-60mm diameter.'
),
(
    '66666666-6666-4666-a666-666666666662',
    '55555555-5555-4555-a555-555555555552',
    '33333333-3333-4333-a333-333333333333',
    15000,
    15800,
    320,
    270,
    3,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '1 day',
    'active',
    'Sugar-free grade, 45mm+ size. High shelf life.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Bids
INSERT INTO bids (id, auction_id, buyer_id, quantity, price_per_ton, total_value, status)
VALUES 
(
    '77777777-7777-4777-a777-777777777771',
    '66666666-6666-4666-a666-666666666661',
    '44444444-4444-4444-a444-444444444444',
    20,
    19200,
    384000,
    'pending'
),
(
    '77777777-7777-4777-a777-777777777772',
    '66666666-6666-4666-a666-666666666662',
    '44444444-4444-4444-a444-444444444444',
    50,
    15800,
    790000,
    'approved'
) ON CONFLICT (id) DO NOTHING;

-- Seed Orders
INSERT INTO orders (id, bid_id, auction_id, buyer_id, farmer_id, quantity, bid_price, total_value, status, gate_pass_issued)
VALUES 
(
    '88888888-8888-4888-a888-888888888881',
    '77777777-7777-4777-a777-777777777772',
    '66666666-6666-4666-a666-666666666662',
    '44444444-4444-4444-a444-444444444444',
    '33333333-3333-4333-a333-333333333333',
    50,
    15800,
    790000,
    'approved',
    false
) ON CONFLICT (id) DO NOTHING;

-- Seed Payments
INSERT INTO payments (id, order_id, amount, status, payment_method)
VALUES 
(
    '99999999-9999-4999-a999-999999999991',
    '88888888-8888-4888-a888-888888888881',
    790000,
    'pending',
    'Bank Transfer'
) ON CONFLICT (id) DO NOTHING;

-- Seed Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read)
VALUES 
(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    '44444444-4444-4444-a444-444444444444',
    'Bid Approved',
    'Your bid for 50 Tons of Jyoti Potatoes has been approved.',
    'bid_update',
    false
) ON CONFLICT (id) DO NOTHING;
