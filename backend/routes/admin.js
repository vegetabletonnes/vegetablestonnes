import express from 'express';
import supabase from '../db/supabase.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import { sendEmail } from '../utils/email.js';
import { mapRowsToCamel, mapRowToCamel } from '../utils/transform.js';

const router = express.Router();

const logAdminAction = async (adminId, action, targetId, targetTable, metadata = {}) => {
  try {
    await supabase.from('admin_logs').insert([{
      admin_id: adminId,
      action,
      target_id: targetId,
      target_table: targetTable,
      metadata,
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
    .eq('bid_id', bidId)
    .maybeSingle();

  if (existingOrder) return existingOrder;

  const { data: auction } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', bid.auction_id)
    .single();

  const order = {
    bid_id: bid.id,
    auction_id: bid.auction_id,
    buyer_id: bid.buyer_id,
    farmer_id: auction?.farmer_id,
    quantity: bid.quantity,
    bid_price: bid.price_per_ton,
    total_value: bid.total_value,
    status: 'accepted',
    gate_pass_issued: false,
  };

  const { data: insertedOrder, error: insertError } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (insertError) throw insertError;
  return insertedOrder;
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
      { count: pendingRegistrations },
      { data: orders },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('auctions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('auctions').select('*', { count: 'exact', head: true }),
      supabase.from('bids').select('*', { count: 'exact', head: true }),
      supabase.from('bids').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('registration_status', 'pending'),
      supabase.from('orders').select('total_value, quantity'),
    ]);

    res.json({
      totalUsers: totalUsers || 0,
      totalBuyers: totalBuyers || 0,
      totalFarmers: totalFarmers || 0,
      totalProducts: totalProducts || 0,
      activeAuctions: activeAuctions || 0,
      totalAuctions: totalAuctions || 0,
      totalBids: totalBids || 0,
      pendingBids: pendingBids || 0,
      pendingRegistrations: pendingRegistrations || 0,
      totalOrders: orders?.length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + (Number(o.total_value) || 0), 0) || 0,
      totalTonsTraded: orders?.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('users')
      .select('id, name, email, role, company, gstin, pan, phone, location, verified, buyer_id_ref, registration_status, created_at, updated_at');

    if (status) query = query.eq('registration_status', status);

    const { data: users, error } = await query;
    if (error) throw error;
    res.json(mapRowsToCamel(users || []));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/registrations/pending', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, company, gstin, pan, phone, location, registration_status, created_at')
      .eq('role', 'buyer')
      .eq('registration_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(mapRowsToCamel(data || []));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/verify', verifyToken, requireAdmin, async (req, res) => {
  try {
    if (req.body?.reject === true) {
      const { data: user, error } = await supabase
        .from('users')
        .update({ verified: false, registration_status: 'rejected' })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      await sendEmail({
        to: user.email,
        subject: 'VegetableTonnes — Registration update',
        text: `Dear ${user.name},\n\nWe were unable to approve your buyer registration at this time. Please contact our support team for more information.\n\n— VegetableTonnes Team`,
      });

      await logAdminAction(req.user.id, 'reject_registration', req.params.id, 'users');
      return res.json({ message: 'Registration rejected.', user: mapRowToCamel(user) });
    }

    if (req.body?.approve === true) {
      const { data: existing, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (fetchErr || !existing) return res.status(404).json({ error: 'User not found' });

      const buyerIdRef = existing.buyer_id_ref || `VT-BUY-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: user, error } = await supabase
        .from('users')
        .update({
          verified: true,
          registration_status: 'approved',
          buyer_id_ref: buyerIdRef,
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      await createNotification(
        user.id,
        'registration_approved',
        'Registration Approved',
        `Welcome! Your Buyer ID is ${buyerIdRef}. You can now log in and place bids.`,
        { buyerIdRef }
      );

      await sendEmail({
        to: user.email,
        subject: 'VegetableTonnes — Registration approved! Your Buyer ID',
        text: `Dear ${user.name},\n\nCongratulations! Your buyer registration has been approved.\n\nYour Registered Buyer ID: ${buyerIdRef}\nCompany: ${user.company}\n\nYou can now log in at https://vegetablestonnes.vercel.app and participate in live auctions.\n\n— VegetableTonnes Team`,
      });

      await logAdminAction(req.user.id, 'approve_registration', req.params.id, 'users', { buyerIdRef });
      return res.json({ message: 'Buyer approved! ID emailed to buyer.', user: mapRowToCamel(user), buyerIdRef });
    }

    const isVerified = typeof req.body?.verified === 'boolean' ? req.body.verified : true;
    const { data: user, error } = await supabase
      .from('users')
      .update({ verified: isVerified })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'User verification updated.', user: mapRowToCamel(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bids', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: bids, error } = await supabase.from('bids').select('*');
    if (error) throw error;
    res.json(mapRowsToCamel(bids || []));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/bids/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const status = req.body.status;
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (bidError) throw bidError;

    let order = null;

    if (['approved', 'accepted'].includes(bid.status)) {
      order = await ensureOrderForApprovedBid(bid.id);
      createNotification(
        bid.buyer_id,
        'bid_accepted',
        'Bid Accepted',
        `Your bid was accepted. Order is ready for payment.`,
        { bidId: bid.id, orderId: order?.id }
      );
    } else if (bid.status === 'rejected') {
      createNotification(
        bid.buyer_id,
        'bid_rejected',
        'Bid Rejected',
        req.body.note || 'Your bid was rejected.',
        { bidId: bid.id }
      );
    }

    await logAdminAction(req.user.id, 'update_bid_status', bid.id, 'bids', { status: bid.status });
    res.json({ ...mapRowToCamel(bid), orderId: order?.id || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    res.json(mapRowsToCamel(orders || []));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
