import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, company, gstin, pan, phone, location, farmSize } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required.' });
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database error checking email.' });
    }

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const buyerId = role === 'buyer' ? `VT-BUY-${Math.floor(1000 + Math.random() * 9000)}` : null;

    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        name,
        email,
        password_hash: hashed,
        role,
        company,
        gstin,
        pan,
        phone,
        location,
        farm_size: role === 'farmer' ? farmSize : null,
        buyer_id_ref: buyerId,
        verified: false
      }])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    // Create profile
    if (role === 'farmer') {
      await supabase.from('farmer_profiles').insert([{ user_id: userId }]);
    } else if (role === 'buyer') {
      await supabase.from('buyer_profiles').insert([{ user_id: userId }]);
    }

    const token = generateToken(newUser);
    const { password_hash: _, ...userSafe } = newUser;

    res.status(201).json({ message: 'Registration successful!', token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    const { password_hash: _, ...userSafe } = user;

    res.json({ message: 'Login successful!', token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
