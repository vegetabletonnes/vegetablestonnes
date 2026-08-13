import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import supabase from '../db/supabase.js';

const router = Router();

// POST /api/invoices/generate/:orderId — admin generates invoice
router.post('/generate/:orderId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: existing, error: existingError } = await supabase
      .from('invoices')
      .select('*')
      .eq('orderId', req.params.orderId)
      .single();

    if (existing) return res.json(existing);

    const subtotal = order.totalValue || 0;
    const gstRate = 0.05;
    const gstAmount = Math.round(subtotal * gstRate);
    const total = subtotal + gstAmount;

    // We'll need to know how many invoices exist to generate the number
    const { count, error: countError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    if (countError) {
       return res.status(500).json({ error: countError.message });
    }

    const invoice = {
      id: 'INV-VT-' + Date.now(),
      invoiceNumber: 'VT/' + new Date().getFullYear() + '/' + String((count || 0) + 1).padStart(4, '0'),
      orderId: order.id,
      buyerId: order.buyerId,
      buyerName: order.buyerName || order.buyerCompany || '',
      buyerGstin: order.buyerGstin || 'N/A',
      buyerAddress: order.destination || 'N/A',
      commodity: order.commodity,
      variety: order.variety || '',
      grade: order.grade || '',
      quantity: order.quantity,
      pricePerTon: order.bidPrice,
      subtotal,
      gstRate: gstRate * 100,
      gstAmount,
      total,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.name || 'Admin',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data: savedInvoice, error: insertError } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    // Update order with invoiceId
    const orderUpdate = { invoiceId: invoice.id };
    if (order.status === 'payment_successful') {
        orderUpdate.status = 'confirmed';
    }

    const { error: updateOrderError } = await supabase
      .from('orders')
      .update(orderUpdate)
      .eq('id', order.id);

    if (updateOrderError) {
        return res.status(500).json({ error: updateOrderError.message });
    }

    createNotification(
      order.buyerId, 'invoice_generated', 'Invoice Generated',
      `GST Invoice ${invoice.invoiceNumber} for Order ${order.id} is ready.`,
      { invoiceId: invoice.id, orderId: order.id }
    );

    res.status(201).json(savedInvoice || invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/mine — buyer
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('buyerId', req.user.id);
      
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !invoice) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && invoice.buyerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices — admin all
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*');
      
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
