import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import supabase from '../db/supabase.js';

const router = express.Router();

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyerId', req.user.id);
      
    if (error) throw error;
    res.json(orders || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/farmer', verifyToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('farmerId', req.user.id);

    if (error) throw error;
    res.json(orders || []);
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

    const updateData = {
      vehicleNo,
      driverPhone,
      gatePassIssued: true,
      status: 'dispatched',
      updatedAt: new Date().toISOString()
    };

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    createNotification(
      updatedOrder.buyerId,
      'dispatched',
      'Vehicle Assigned',
      `Dispatch vehicle ${vehicleNo} has been assigned for Order ${updatedOrder.id}.`,
      { orderId: updatedOrder.id }
    );

    res.json({ message: 'Vehicle assigned. Gate Pass Issued!', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['accepted', 'payment_pending', 'payment_successful', 'confirmed', 'preparing_dispatch', 'dispatched', 'delivered', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (fetchError || !order) return res.status(404).json({ error: 'Order not found' });

    const updateData = {
      status,
      updatedAt: new Date().toISOString()
    };

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    const notificationType = status === 'delivered' || status === 'completed' ? 'delivered' : 'dispatched';
    createNotification(
      updatedOrder.buyerId,
      notificationType,
      'Order Status Updated',
      `Order ${updatedOrder.id} is now marked as ${status.replace(/_/g, ' ')}.`,
      { orderId: updatedOrder.id, status }
    );

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
