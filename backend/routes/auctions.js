import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/auctions
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('auctions').select('*');
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auctions/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Auction not found' });
      }
      throw error;
    }
    if (!data) return res.status(404).json({ error: 'Auction not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auctions/:id/bids
router.get('/:id/bids', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('auctionId', req.params.id)
      .order('pricePerTon', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auctions (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const auction = {
      id: `auc-${uuidv4().slice(0,8)}`,
      ...req.body,
      currentHighestBid: req.body.basePrice,
      totalBids: 0,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('auctions')
      .insert([auction])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data || auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auctions/:id (admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .update({ ...req.body, updatedAt: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Auction not found' });
      }
      throw error;
    }
    if (!data) return res.status(404).json({ error: 'Auction not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auctions/:id (admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    // using count: 'exact' to check if a row was actually deleted
    const { error, count } = await supabase
      .from('auctions')
      .delete({ count: 'exact' })
      .eq('id', req.params.id);
    if (error) throw error;
    // Note: depending on the supabase-js version count might be null if not requested, but we requested it
    if (count === 0) return res.status(404).json({ error: 'Auction not found' });
    res.json({ message: 'Auction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
