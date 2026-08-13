import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import supabase from '../db/supabase.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    let query = supabase.from('products').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id);
      
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const product = { 
      id: `prod-${uuidv4().slice(0, 8)}`, 
      ...req.body, 
      active: true, 
      createdAt: new Date().toISOString() 
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
      
    if (error) throw error;
    
    res.status(201).json(data[0] || product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select();
      
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .select();
      
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
