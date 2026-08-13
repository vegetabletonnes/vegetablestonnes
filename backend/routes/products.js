import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import { mapRowToCamel, mapRowsToCamel } from '../utils/transform.js';

const router = express.Router();
const DEFAULT_FARMER_ID = '22222222-2222-4222-a222-222222222222';

const formatProduct = (row) => {
  const p = mapRowToCamel(row);
  return {
    ...p,
    farmerName: p.farmerName || row?.farmer_name || 'VegetableTonnes Farm Network',
    location: p.origin || row?.origin,
    pricePerKg: row?.base_price ? Number(row.base_price) / 1000 : 0,
    totalTons: Number(row?.available_stock || 0),
    qualityGrade: row?.grade || 'A',
  };
};

const toDbProduct = (body) => ({
  farmer_id: body.farmerId || DEFAULT_FARMER_ID,
  name: body.name,
  category: body.category || 'Other',
  grade: body.qualityGrade || body.grade || 'A',
  description: body.description,
  image: body.image,
  base_price: body.pricePerKg
    ? Number(body.pricePerKg) * 1000
    : Number(body.basePrice || body.base_price || 1),
  available_stock: Number(body.totalTons || body.availableStock || body.available_stock || 0),
  origin: body.location || body.origin,
  active: body.active !== false,
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    let query = supabase.from('products').select('*');

    if (category) query = query.eq('category', category);
    if (active !== undefined) query = query.eq('active', active === 'true');

    const { data, error } = await query;
    if (error) throw error;

    res.json((data || []).map(formatProduct));
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
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Product not found' });
      throw error;
    }

    res.json(formatProduct(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const row = toDbProduct(req.body);

    const { data, error } = await supabase
      .from('products')
      .insert([row])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(formatProduct(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const row = toDbProduct(req.body);

    const { data, error } = await supabase
      .from('products')
      .update(row)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Product not found' });
      throw error;
    }

    res.json(formatProduct(data));
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
    if (!data?.length) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
