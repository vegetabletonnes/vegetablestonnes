import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { generateToken } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import { sendEmail, getAdminEmail } from '../utils/email.js';
import { mapRowToCamel } from '../utils/transform.js';

const router = express.Router();
const ADMIN_USER_ID = '11111111-1111-4111-a111-111111111111';

const safeUser = (user) => {
  const u = mapRowToCamel(user);
  delete u.passwordHash;
  return u;
};

// POST /api/auth/register — buyer only, pending admin approval
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, gstin, pan, phone, location } = req.body;
    const role = 'buyer';

    if (!name || !email || !password || !company || !gstin || !pan || !phone || !location) {
      return res.status(400).json({ error: 'All buyer registration fields are required.' });
    }

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, registration_status')
      .eq('email', email)
      .maybeSingle();

    if (checkError) return res.status(500).json({ error: 'Database error checking email.' });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = uuidv4();

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
        buyer_id_ref: null,
        verified: false,
        registration_status: 'pending',
      }])
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });

    await supabase.from('buyer_profiles').insert([{ user_id: userId }]);

    await createNotification(
      ADMIN_USER_ID,
      'registration_pending',
      'New Buyer Registration',
      `${name} (${company}) has requested buyer registration. GSTIN: ${gstin}`,
      { userId, email, company }
    );

    const adminEmail = getAdminEmail();
    await sendEmail({
      to: adminEmail,
      subject: `[VegetableTonnes] New buyer registration — ${company}`,
      text: `A new buyer has registered and needs approval.\n\nName: ${name}\nCompany: ${company}\nEmail: ${email}\nGSTIN: ${gstin}\nPAN: ${pan}\nPhone: ${phone}\nLocation: ${location}\n\nPlease review in the Admin Panel → Buyers.`,
    });

    await sendEmail({
      to: email,
      subject: 'VegetableTonnes — Registration received',
      text: `Dear ${name},\n\nThank you for registering with VegetableTonnes.\n\nYour buyer account is pending verification by our team. You will receive your registered Buyer ID by email once approved.\n\nCompany: ${company}\n\n— VegetableTonnes Team`,
    });

    res.status(201).json({
      message: 'Registration submitted! Our team will verify your details and email your Buyer ID once approved.',
      pending: true,
    });
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

    if (user.role === 'buyer') {
      if (user.registration_status === 'pending') {
        return res.status(403).json({
          error: 'Your registration is pending admin approval. You will receive your Buyer ID by email once verified.',
        });
      }
      if (user.registration_status === 'rejected') {
        return res.status(403).json({
          error: 'Your registration was not approved. Please contact VegetableTonnes support.',
        });
      }
      if (!user.verified) {
        return res.status(403).json({
          error: 'Your account is not yet verified. Please wait for admin approval.',
        });
      }
    }

    const token = generateToken(user);
    const userSafe = safeUser(user);

    res.json({ message: 'Login successful!', token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/me - Update profile
router.put('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    // We will verify the token to ensure the user is logged in
    const tokenStr = authHeader.split(' ')[1];
    if (!tokenStr) return res.status(401).json({ error: 'Invalid token' });
    
    // Manually verify since we aren't using the middleware in this file
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
    const decoded = jwt.verify(tokenStr, JWT_SECRET);
    
    const { name, company, phone, location } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (company) updates.company = company;
    if (phone) updates.phone = phone;
    if (location) updates.location = location;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', decoded.id)
      .select()
      .single();

    if (error) throw error;
    
    const newToken = generateToken(user);
    res.json({ message: 'Profile updated', user: safeUser(user), token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
