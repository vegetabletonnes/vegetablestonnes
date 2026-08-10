import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

const notifsPath = join(__dirname, '../data/notifications.json');

const readNotifs = () => JSON.parse(readFileSync(notifsPath, 'utf-8'));
const writeNotifs = (data) => writeFileSync(notifsPath, JSON.stringify(data, null, 2));

// Internal helper — called by other routes
export const createNotification = (userId, type, title, message, metadata = {}) => {
  try {
    const notifs = readNotifs();
    const notif = {
      id: 'NOTIF' + Date.now() + Math.floor(Math.random() * 1000),
      userId,
      type,
      title,
      message,
      metadata,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(notif);
    writeNotifs(notifs);
    return notif;
  } catch { return null; }
};

// GET /api/notifications/mine
router.get('/mine', verifyToken, (req, res) => {
  try {
    const notifs = readNotifs();
    res.json(notifs.filter(n => n.userId === req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', verifyToken, (req, res) => {
  try {
    const notifs = readNotifs();
    const count = notifs.filter(n => n.userId === req.user.id && !n.read).length;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/mark-read/:id
router.post('/mark-read/:id', verifyToken, (req, res) => {
  try {
    const notifs = readNotifs();
    const idx = notifs.findIndex(n => n.id === req.params.id && n.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    notifs[idx].read = true;
    writeNotifs(notifs);
    res.json(notifs[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', verifyToken, (req, res) => {
  try {
    const notifs = readNotifs();
    notifs.forEach(n => { if (n.userId === req.user.id) n.read = true; });
    writeNotifs(notifs);
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
