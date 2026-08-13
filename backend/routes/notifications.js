import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import supabase from '../db/supabase.js';

const router = Router();

// Internal helper — called by other routes
export const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        userId,
        type,
        title,
        message,
        metadata,
        read: false
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// GET /api/notifications/mine
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', req.user.id)
      .order('createdAt', { ascending: false });
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const { error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('userId', req.user.id)
      .eq('read', false);
      
    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/mark-read/:id
router.post('/mark-read/:id', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('userId', req.user.id)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
      throw error;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('userId', req.user.id)
      .eq('read', false);
      
    if (error) throw error;
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
