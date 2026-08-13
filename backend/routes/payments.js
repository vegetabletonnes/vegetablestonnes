import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import supabase from '../db/supabase.js';

const router = Router();

router.post('/initiate', verifyToken, async (req, res) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId || !method) return res.status(400).json({ error: 'orderId and method required' });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('buyer_id', req.user.id)
      .single();

    if (orderError || !order) return res.status(404).json({ error: 'Order not found' });

    if (!['accepted', 'approved'].includes(order.status)) {
      return res.status(400).json({ error: 'Order must be accepted before payment' });
    }

    // Attempt to update the order status to payment_pending
    await supabase
      .from('orders')
      .update({ status: 'payment_pending' })
      .eq('id', orderId);

    const paymentData = {
      order_id: orderId,
      amount: order.total_value,
      status: 'pending',
      payment_method: method,
      transaction_id: `TXN${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    };

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) throw paymentError;

    res.json({ 
      payment: {
        id: payment.id,
        orderId: payment.order_id,
        buyerId: req.user.id,
        amount: payment.amount,
        method: payment.payment_method,
        status: payment.status,
        reference: payment.transaction_id,
        createdAt: payment.created_at
      }, 
      message: 'Payment initiated' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/confirm', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.body;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, orders!inner(buyer_id)')
      .eq('id', paymentId)
      .eq('orders.buyer_id', req.user.id)
      .single();

    if (paymentError || !payment) return res.status(404).json({ error: 'Payment not found' });

    const { data: updatedPayment, error: updatePaymentError } = await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', paymentId)
      .select()
      .single();

    if (updatePaymentError) throw updatePaymentError;

    await supabase
      .from('orders')
      .update({ status: 'payment_successful' })
      .eq('id', payment.order_id);

    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', payment.order_id)
      .single();

    let invoice = existingInvoice;

    if (!invoice) {
      const invoiceData = {
        order_id: payment.order_id,
        invoice_number: `VT/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
      };

      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invoiceError) throw invoiceError;
      invoice = newInvoice;
    }

    createNotification(
      req.user.id,
      'payment_received',
      'Payment Successful',
      `Payment of Rs.${updatedPayment.amount?.toLocaleString()} confirmed for Order ${payment.order_id}.`,
      { paymentId, orderId: payment.order_id }
    );

    if (invoice) {
      createNotification(
        req.user.id,
        'invoice_generated',
        'Invoice Generated',
        `Invoice ${invoice.invoice_number} is ready for Order ${payment.order_id}.`,
        { invoiceId: invoice.id, orderId: payment.order_id }
      );
    }

    res.json({ 
      payment: {
        id: updatedPayment.id,
        orderId: updatedPayment.order_id,
        amount: updatedPayment.amount,
        status: updatedPayment.status,
        method: updatedPayment.payment_method,
        reference: updatedPayment.transaction_id,
        createdAt: updatedPayment.created_at
      }, 
      invoice, 
      message: 'Payment confirmed' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*, orders!inner(buyer_id)')
      .eq('orders.buyer_id', req.user.id);
      
    if (error) throw error;

    const formatted = payments.map(p => ({
      id: p.id,
      orderId: p.order_id,
      buyerId: p.orders?.buyer_id,
      amount: p.amount,
      status: p.status,
      method: p.payment_method,
      reference: p.transaction_id,
      createdAt: p.created_at
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*');
      
    if (error) throw error;
    res.json(payments || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
