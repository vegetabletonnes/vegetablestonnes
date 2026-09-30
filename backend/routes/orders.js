import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import supabase from '../db/supabase.js';
import { mapRowsToCamel, mapRowToCamel } from '../utils/transform.js';

const router = express.Router();

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        auctions (
          products (
            name,
            category,
            variety,
            grade
          )
        ),
        invoices (
          id,
          invoice_number
        )
      `)
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (orders || []).map(o => {
      const camel = mapRowToCamel(o);
      const prod = o.auctions?.products;
      const inv = Array.isArray(o.invoices) ? o.invoices[0] : o.invoices;
      return {
        ...camel,
        commodity: prod?.name || prod?.category || 'Fresh Produce',
        variety: prod?.variety || 'Standard',
        grade: prod?.grade || 'A',
        invoiceId: inv?.id || null,
        invoiceNumber: inv?.invoice_number || null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Orders /mine error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/farmer', verifyToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        auctions (
          products (
            name,
            category,
            variety,
            grade
          )
        ),
        invoices (
          id,
          invoice_number
        )
      `)
      .eq('farmer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (orders || []).map(o => {
      const camel = mapRowToCamel(o);
      const prod = o.auctions?.products;
      const inv = Array.isArray(o.invoices) ? o.invoices[0] : o.invoices;
      return {
        ...camel,
        commodity: prod?.name || prod?.category || 'Fresh Produce',
        variety: prod?.variety || 'Standard',
        grade: prod?.grade || 'A',
        invoiceId: inv?.id || null,
        invoiceNumber: inv?.invoice_number || null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Orders /farmer error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/vehicle', verifyToken, async (req, res) => {
  try {
    const { vehicleNo, driverPhone } = req.body;

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !order) return res.status(404).json({ error: 'Order not found' });

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        vehicle_no: vehicleNo,
        driver_phone: driverPhone,
        gate_pass_issued: true,
        status: 'shipped',
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    createNotification(
      updatedOrder.buyer_id,
      'dispatched',
      'Vehicle Assigned',
      `Dispatch vehicle ${vehicleNo} has been assigned for your order.`,
      { orderId: updatedOrder.id }
    );

    res.json({ message: 'Vehicle assigned. Gate Pass Issued!', order: mapRowToCamel(updatedOrder) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [
      'draft', 'pending', 'approved', 'accepted', 'rejected', 'counter_offered',
      'payment_pending', 'payment_successful', 'confirmed', 'preparing_dispatch',
      'dispatched', 'shipped', 'delivered', 'completed', 'cancelled'
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') return res.status(404).json({ error: 'Order not found' });
      throw updateError;
    }

    createNotification(
      updatedOrder.buyer_id,
      'order_update',
      'Order Status Updated',
      `Your order is now marked as ${status.replace(/_/g, ' ')}.`,
      { orderId: updatedOrder.id, status }
    );

    res.json(mapRowToCamel(updatedOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
