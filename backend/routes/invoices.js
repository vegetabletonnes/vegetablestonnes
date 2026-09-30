import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import supabase from '../db/supabase.js';

const router = Router();

// Helper to format an invoice with full buyer and order details
const formatInvoiceRecord = async (inv) => {
  const order = inv.orders;
  let commodity = 'Fresh Produce';
  let variety = 'Standard';
  let grade = 'A';

  if (order?.auction_id) {
    const { data: auction } = await supabase
      .from('auctions')
      .select('*, products(name, category, variety, grade)')
      .eq('id', order.auction_id)
      .single();

    if (auction?.products) {
      commodity = auction.products.name || auction.products.category || commodity;
      variety = auction.products.variety || variety;
      grade = auction.products.grade || grade;
    }
  }

  let buyerUser = null;
  if (order?.buyer_id) {
    const { data: bUser } = await supabase
      .from('users')
      .select('id, name, company, gstin, location')
      .eq('id', order.buyer_id)
      .single();
    buyerUser = bUser;
  }

  const subtotal = Number(order?.total_value || 0);
  const gstRate = 5;
  const gstAmount = Math.round(subtotal * (gstRate / 100));
  const total = subtotal + gstAmount;

  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    orderId: order?.id || inv.order_id,
    buyerId: order?.buyer_id,
    buyerName: buyerUser?.name || buyerUser?.company || 'Buyer',
    buyerGstin: buyerUser?.gstin || '29ABCDE1234F1ZH',
    buyerAddress: buyerUser?.location || 'APMC Yard, Bengaluru',
    commodity,
    variety,
    grade,
    quantity: Number(order?.quantity || 1),
    pricePerTon: Number(order?.bid_price || subtotal),
    subtotal,
    gstRate,
    gstAmount,
    total,
    status: 'paid',
    generatedAt: inv.issued_at || inv.created_at,
    dueDate: new Date(new Date(inv.created_at || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceUrl: inv.invoice_url
  };
};

// POST /api/invoices/generate/:orderId — admin generates invoice
router.post('/generate/:orderId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: existing } = await supabase
      .from('invoices')
      .select('*, orders(*)')
      .eq('order_id', orderId)
      .single();

    if (existing) {
      const formatted = await formatInvoiceRecord(existing);
      return res.json(formatted);
    }

    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    const invoiceNumber = `VT/${new Date().getFullYear()}/${String((count || 0) + 1).padStart(4, '0')}`;

    const { data: newInv, error: insertError } = await supabase
      .from('invoices')
      .insert([{
        order_id: orderId,
        invoice_number: invoiceNumber,
        issued_at: new Date().toISOString()
      }])
      .select('*, orders(*)')
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    if (order.status === 'payment_successful') {
      await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);
    }

    createNotification(
      order.buyer_id,
      'invoice_generated',
      'Invoice Generated',
      `GST Invoice ${invoiceNumber} for Order ${orderId} is ready.`,
      { invoiceId: newInv.id, orderId }
    );

    const formatted = await formatInvoiceRecord(newInv);
    res.status(201).json(formatted);
  } catch (err) {
    console.error('Invoice generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/mine — buyer invoices
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        orders!inner (
          id,
          buyer_id,
          farmer_id,
          quantity,
          bid_price,
          total_value,
          status,
          auction_id
        )
      `)
      .eq('orders.buyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = await Promise.all((invoices || []).map(formatInvoiceRecord));
    res.json(formatted);
  } catch (err) {
    console.error('Invoices /mine error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        orders (
          id,
          buyer_id,
          farmer_id,
          quantity,
          bid_price,
          total_value,
          status,
          auction_id
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !invoice) return res.status(404).json({ error: 'Invoice not found' });

    if (req.user.role !== 'admin' && invoice.orders?.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const formatted = await formatInvoiceRecord(invoice);
    res.json(formatted);
  } catch (err) {
    console.error('Invoice by ID error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices — admin all
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        orders (
          id,
          buyer_id,
          farmer_id,
          quantity,
          bid_price,
          total_value,
          status,
          auction_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const formatted = await Promise.all((invoices || []).map(formatInvoiceRecord));
    res.json(formatted);
  } catch (err) {
    console.error('Invoices admin all error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
