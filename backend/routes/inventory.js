import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import { mapRowToCamel, mapRowsToCamel } from '../utils/transform.js';

const router = Router();

const formatInventory = (row) => {
  const item = mapRowToCamel(row);
  return {
    ...item,
    basePricePerTon: Number(row?.base_price_per_ton || 0),
    availableTons: Number(row?.available_tons || 0),
    totalQuantityTons: Number(row?.total_quantity_tons || 0),
    auctionStatus: row?.auction_status,
    isDefault: row?.is_default,
  };
};

const toDbInventory = (body) => ({
  commodity: body.commodity,
  variety: body.variety,
  grade: body.grade,
  description: body.description,
  warehouse: body.warehouse,
  origin: body.origin,
  base_price_per_ton: Number(body.basePricePerTon || body.base_price_per_ton || 0),
  available_tons: Number(body.availableTons || body.available_tons || 0),
  total_quantity_tons: Number(body.totalQuantityTons || body.total_quantity_tons || body.availableTons || 0),
  status: body.status || 'available',
  auction_status: body.auctionStatus || body.auction_status || 'upcoming',
  is_default: body.isDefault || false,
});

// GET /api/inventory
router.get('/', async (req, res) => {
  try {
    const { commodity, grade, status, auctionStatus, search } = req.query;
    let query = supabase.from('inventory').select('*');

    if (commodity) query = query.ilike('commodity', `%${commodity}%`);
    if (grade) query = query.eq('grade', grade);
    if (status) query = query.eq('status', status);
    if (auctionStatus) query = query.eq('auction_status', auctionStatus);
    if (search) {
      const q = `%${search.replace(/,/g, '')}%`;
      query = query.or(`commodity.ilike.${q},variety.ilike.${q},warehouse.ilike.${q},origin.ilike.${q}`);
    }

    const { data: items, error } = await query;
    if (error) throw error;

    res.json((items || []).map(formatInventory));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/:id
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

    res.json(formatInventory(item));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const row = {
      id: 'INV' + String(Date.now()).slice(-6),
      ...toDbInventory(req.body),
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([row])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(formatInventory(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/inventory/:id (admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update(toDbInventory(req.body))
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
      throw error;
    }

    res.json(formatInventory(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inventory/:id (admin)
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

    res.json({ message: 'Deleted', item: formatInventory(item) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
