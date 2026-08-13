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
      .select('*')
      .eq('buyer_id', req.user.id);

    if (error) throw error;
    res.json(mapRowsToCamel(orders || []));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/farmer', verifyToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('farmer_id', req.user.id);

    if (error) throw error;
    res.json(mapRowsToCamel(orders || []));
  } catch (err) {
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
    const allowed = ['pending', 'approved', 'accepted', 'payment_pending', 'shipped', 'delivered', 'cancelled'];
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
