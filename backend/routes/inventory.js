import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import supabase from '../db/supabase.js';

const router = Router();

// GET /api/inventory — public list with filters
router.get('/', async (req, res) => {
  try {
    const { commodity, grade, status, auctionStatus, search } = req.query;
    
    let query = supabase.from('inventory').select('*');

    if (commodity) {
      query = query.ilike('commodity', `%${commodity}%`);
    }
    if (grade) {
      query = query.eq('grade', grade);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (auctionStatus) {
      query = query.eq('auctionStatus', auctionStatus);
    }
    if (search) {
      const q = `%${search.replace(/,/g, '')}%`;
      query = query.or(`commodity.ilike.${q},variety.ilike.${q},warehouse.ilike.${q},origin.ilike.${q}`);
    }

    const { data: items, error } = await query;
    if (error) throw error;
    
    res.json(items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/:id — single item
router.get('/:id', async (req, res) => {
  try {
    const { data: item, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
      throw error;
    }
    
    if (!item) return res.status(404).json({ error: 'Not found' });
    
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory — admin create
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const newItem = {
      id: 'INV' + String(Date.now()).slice(-6),
      ...req.body,
      status: req.body.status || 'available',
      auctionStatus: req.body.auctionStatus || 'upcoming',
    };

    if (!newItem.createdAt) {
      newItem.createdAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert([newItem])
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/inventory/:id — admin update
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
       if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
       throw error;
    }
    
    if (!data) return res.status(404).json({ error: 'Not found' });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inventory/:id — admin delete
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: item, error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
       if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
       throw error;
    }
    
    if (!item) return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Deleted', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
