import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import { mapRowsToCamel, mapRowToCamel } from '../utils/transform.js';

const router = Router();

export const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        metadata,
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return mapRowToCamel(data);
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(mapRowsToCamel(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const { error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mark-read/:id', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
      throw error;
    }
    res.json(mapRowToCamel(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mark-all-read', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) throw error;
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
