import express from 'express';
import supabase from '../db/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { mapRowToCamel, mapRowsToCamel } from '../utils/transform.js';

const router = express.Router();
const DEFAULT_FARMER_ID = '22222222-2222-4222-a222-222222222222';

const formatAuction = (row, product) => {
  const a = mapRowToCamel(row);
  return {
    ...a,
    productName: product?.name || a.productName,
    farmerName: product?.farmer_name,
    location: product?.origin,
    image: product?.image,
    qualityGrade: product?.grade,
    endTime: a.endTime,
    basePrice: Number(a.basePrice || 0),
    availableStock: Number(a.availableStock || 0),
    currentHighestBid: Number(a.currentHighestBid || 0),
  };
};

const toDbAuction = async (body, userId) => {
  let productId = body.productId || body.product_id;
  let farmerId = body.farmerId || body.farmer_id;
  let product = null;

  if (productId) {
    const { data } = await supabase.from('products').select('*').eq('id', productId).single();
    product = data;
    farmerId = data?.farmer_id || farmerId;
  }

  const stock = Number(body.availableStock || body.available_stock || body.totalStock || body.total_stock || 0);
  const basePrice = Number(body.basePrice || body.base_price || product?.base_price || 0);
  const now = new Date();
  const endTime = body.endTime
    ? new Date(body.endTime)
    : new Date(now.getTime() + Number(body.durationHours || 24) * 3600 * 1000);

  return {
    row: {
      product_id: productId || product?.id,
      farmer_id: farmerId || userId || DEFAULT_FARMER_ID,
      base_price: basePrice,
      current_highest_bid: basePrice,
      total_stock: stock,
      available_stock: stock,
      min_order: Number(body.minOrder || body.min_order || 1),
      start_time: body.startTime || now.toISOString(),
      end_time: endTime.toISOString(),
      status: body.status || 'active',
      description: body.description || body.productName || product?.description,
    },
    product,
  };
};

// GET /api/auctions
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('auctions').select('*');
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    const productIds = [...new Set((data || []).map((a) => a.product_id).filter(Boolean))];
    let productsMap = {};
    if (productIds.length) {
      const { data: products } = await supabase.from('products').select('*').in('id', productIds);
      productsMap = Object.fromEntries((products || []).map((p) => [p.id, p]));
    }

    res.json((data || []).map((a) => formatAuction(a, productsMap[a.product_id])));
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
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Auction not found' });
      throw error;
    }

    let product = null;
    if (data.product_id) {
      const { data: p } = await supabase.from('products').select('*').eq('id', data.product_id).single();
      product = p;
    }

    res.json(formatAuction(data, product));
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
      .eq('auction_id', req.params.id)
      .order('price_per_ton', { ascending: false });

    if (error) throw error;
    res.json(mapRowsToCamel(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auctions (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    let { row, product } = await toDbAuction(req.body, req.user.id);

    if (!row.product_id) {
      // Find a valid admin or farmer in the DB to associate this dummy product with
      const { data: validUser } = await supabase.from('users').select('id').limit(1).single();
      const insertFarmerId = validUser ? validUser.id : '11111111-1111-4111-a111-111111111111';
      row.farmer_id = insertFarmerId;

      // Auto-create a product for this custom auction
      const { data: newProduct, error: prodErr } = await supabase
        .from('products')
        .insert([{
          farmer_id: insertFarmerId,
          name: req.body.productName || 'Custom Auction Product',
          category: 'Other',
          grade: req.body.qualityGrade || 'A',
          base_price: row.base_price,
          available_stock: row.total_stock,
          image: req.body.image,
          active: true
        }])
        .select()
        .single();

      if (prodErr) throw prodErr;
      row.product_id = newProduct.id;
      product = newProduct;
    }

    const { data, error } = await supabase
      .from('auctions')
      .insert([row])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(formatAuction(data, product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auctions/:id (admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.basePrice || req.body.base_price) updates.base_price = Number(req.body.basePrice || req.body.base_price);
    if (req.body.availableStock || req.body.available_stock) {
      const stock = Number(req.body.availableStock || req.body.available_stock);
      updates.available_stock = stock;
      updates.total_stock = stock;
    }
    if (req.body.endTime) updates.end_time = req.body.endTime;
    if (req.body.description) updates.description = req.body.description;

    const { data, error } = await supabase
      .from('auctions')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Auction not found' });
      throw error;
    }

    let product = null;
    if (data.product_id) {
      const { data: p } = await supabase.from('products').select('*').eq('id', data.product_id).single();
      product = p;
    }

    res.json(formatAuction(data, product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auctions/:id (admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { error, count } = await supabase
      .from('auctions')
      .delete({ count: 'exact' })
      .eq('id', req.params.id);

    if (error) throw error;
    if (count === 0) return res.status(404).json({ error: 'Auction not found' });
    res.json({ message: 'Auction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
