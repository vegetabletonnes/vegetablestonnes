import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const ordersDb = new Low(new JSONFile(join(__dirname, '../data/orders.json')), { orders: [] });

router.get('/mine', verifyToken, async (req, res) => {
  try {
    await ordersDb.read();
    const orders = ordersDb.data.orders.filter((order) => order.buyerId === req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/farmer', verifyToken, async (req, res) => {
  try {
    await ordersDb.read();
    const orders = ordersDb.data.orders.filter((order) => order.farmerId === req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/vehicle', verifyToken, async (req, res) => {
  try {
    await ordersDb.read();
    const { vehicleNo, driverPhone } = req.body;
    const orderIndex = ordersDb.data.orders.findIndex((order) => order.id === req.params.id);
    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    ordersDb.data.orders[orderIndex].vehicleNo = vehicleNo;
    ordersDb.data.orders[orderIndex].driverPhone = driverPhone;
    ordersDb.data.orders[orderIndex].gatePassIssued = true;
    ordersDb.data.orders[orderIndex].status = 'dispatched';
    ordersDb.data.orders[orderIndex].updatedAt = new Date().toISOString();
    await ordersDb.write();

    createNotification(
      ordersDb.data.orders[orderIndex].buyerId,
      'dispatched',
      'Vehicle Assigned',
      `Dispatch vehicle ${vehicleNo} has been assigned for Order ${ordersDb.data.orders[orderIndex].id}.`,
      { orderId: ordersDb.data.orders[orderIndex].id }
    );

    res.json({ message: 'Vehicle assigned. Gate Pass Issued!', order: ordersDb.data.orders[orderIndex] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    await ordersDb.read();
    const orderIndex = ordersDb.data.orders.findIndex((order) => order.id === req.params.id);
    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    const { status } = req.body;
    const allowedStatuses = ['accepted', 'payment_pending', 'payment_successful', 'confirmed', 'preparing_dispatch', 'dispatched', 'delivered', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    ordersDb.data.orders[orderIndex].status = status;
    ordersDb.data.orders[orderIndex].updatedAt = new Date().toISOString();
    await ordersDb.write();

    const notificationType = status === 'delivered' || status === 'completed' ? 'delivered' : 'dispatched';
    createNotification(
      ordersDb.data.orders[orderIndex].buyerId,
      notificationType,
      'Order Status Updated',
      `Order ${ordersDb.data.orders[orderIndex].id} is now marked as ${status.replace(/_/g, ' ')}.`,
      { orderId: ordersDb.data.orders[orderIndex].id, status }
    );

    res.json(ordersDb.data.orders[orderIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
