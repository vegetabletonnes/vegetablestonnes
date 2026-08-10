import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateToken } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const usersDb = new Low(new JSONFile(join(__dirname, '../data/users.json')), { users: [] });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    await usersDb.read();
    const { name, email, password, role, company, gstin, pan, phone, location, farmSize } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required.' });
    }

    const existing = usersDb.data.users.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const buyerId = role === 'buyer' ? `VT-BUY-${Math.floor(1000 + Math.random() * 9000)}` : null;

    const newUser = {
      id, name, email,
      password: hashed,
      role, company, gstin, pan, phone, location,
      farmSize: role === 'farmer' ? farmSize : null,
      buyerId,
      verified: false,
      createdAt: new Date().toISOString()
    };

    usersDb.data.users.push(newUser);
    await usersDb.write();

    const token = generateToken(newUser);
    const { password: _, ...userSafe } = newUser;

    res.status(201).json({ message: 'Registration successful!', token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    await usersDb.read();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = usersDb.data.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    res.json({ message: 'Login successful!', token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
