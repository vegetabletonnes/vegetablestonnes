import express from 'express';
import supabase from '../db/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

const logAdminAction = async (adminId, action, entityId, entityType, details = {}) => {
  try {
    await supabase.from('admin_logs').insert([{
      adminId,
      action,
      entityId,
      entityType,
      details,
      createdAt: new Date().toISOString()
    }]);
  } catch (err) {
    console.error('Error logging admin action:', err);
  }
};

const ensureOrderForApprovedBid = async (bidId) => {
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select('*')
    .eq('id', bidId)
    .single();

  if (bidError || !bid) throw new Error('Bid not found');

  const { data: existingOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('bidId', bidId)
    .single();

  if (existingOrder) return existingOrder;

  const { data: auction } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', bid.auctionId)
    .single();

  const newOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const order = {
    id: newOrderId,
    bidId: bid.id,
    auctionId: bid.auctionId,
    buyerId: bid.buyerId,
    buyerName: bid.buyerName,
    buyerCompany: bid.buyerCompany,
    buyerGstin: bid.buyerGstin || null,
    farmerId: auction?.farmerId,
    farmerName: auction?.farmerName,
    commodity: auction?.productName || bid.commodity,
    variety: auction?.variety || '',
    grade: auction?.grade || '',
    quantity: bid.quantity,
    bidPrice: bid.pricePerTon,
    totalValue: bid.totalValue,
    destination: bid.destination || '',
    deliveryDate: bid.deliveryDate || null,
    remarks: bid.remarks || '',
    status: 'accepted',
    vehicleNo: null,
    driverPhone: null,
    gatePassIssued: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { data: insertedOrder, error: insertError } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (insertError) throw insertError;
  return insertedOrder || order;
};

router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalBuyers },
      { count: totalFarmers },
      { count: totalProducts },
      { count: activeAuctions },
      { count: totalAuctions },
      { count: totalBids },
      { count: pendingBids },
      { data: orders }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('auctions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('auctions').select('*', { count: 'exact', head: true }),
      supabase.from('bids').select('*', { count: 'exact', head: true }),
      supabase.from('bids').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('totalValue, quantity')
    ]);

    const stats = {
      totalUsers: totalUsers || 0,
      totalBuyers: totalBuyers || 0,
      totalFarmers: totalFarmers || 0,
      totalProducts: totalProducts || 0,
      activeAuctions: activeAuctions || 0,
      totalAuctions: totalAuctions || 0,
      totalBids: totalBids || 0,
      pendingBids: pendingBids || 0,
      totalOrders: orders?.length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + (Number(o.totalValue) || 0), 0) || 0,
      totalTonsTraded: orders?.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0) || 0
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, companyName, gstin, phone, address, verified, createdAt, updatedAt');
    
    if (error) throw error;
    res.json(users || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/verify', verifyToken, requireAdmin, async (req, res) => {
  try {
    const isVerified = typeof req.body?.verified === 'boolean' ? req.body.verified : true;

    const { data: user, error } = await supabase
      .from('users')
      .update({ verified: isVerified, updatedAt: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('id, name, email, role, companyName, gstin, phone, address, verified, createdAt, updatedAt')
      .single();

    if (error) throw error;

    await logAdminAction(req.user?.id || 'admin', 'verify_user', req.params.id, 'user', { verified: isVerified });

    res.json({ message: 'User verification updated.', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bids', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: bids, error } = await supabase.from('bids').select('*');
    if (error) throw error;
    res.json(bids || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/bids/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (bidError) throw bidError;

    let order = null;

    if (['approved', 'accepted'].includes(bid.status)) {
      order = await ensureOrderForApprovedBid(bid.id);
      createNotification(
        bid.buyerId,
        'bid_accepted',
        'Bid Accepted',
        `Your bid for ${bid.commodity || bid.auctionId} was accepted. Order ${order.id} is ready for payment.`,
        { bidId: bid.id, orderId: order.id }
      );
    } else if (bid.status === 'rejected') {
      createNotification(
        bid.buyerId,
        'bid_rejected',
        'Bid Rejected',
        req.body.note || `Your bid for ${bid.commodity || bid.auctionId} was rejected.`,
        { bidId: bid.id }
      );
    } else if (bid.status === 'counter_offered') {
      createNotification(
        bid.buyerId,
        'counter_offer',
        'Counter Offer Received',
        `A revised offer of Rs.${Number(bid.counterPrice || 0).toLocaleString()}/ton has been sent for your bid.`,
        { bidId: bid.id, counterPrice: bid.counterPrice }
      );
    } else if (bid.status === 'clarification_requested') {
      createNotification(
        bid.buyerId,
        'counter_offer',
        'Clarification Requested',
        bid.clarificationNote || 'The procurement team has requested clarification on your bid.',
        { bidId: bid.id }
      );
    }

    await logAdminAction(req.user?.id || 'admin', 'update_bid_status', bid.id, 'bid', { status: bid.status });

    res.json({ ...bid, orderId: order?.id || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    res.json(orders || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
