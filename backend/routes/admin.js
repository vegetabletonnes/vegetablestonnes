import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const usersDb = new Low(new JSONFile(join(__dirname, '../data/users.json')), { users: [] });
const productsDb = new Low(new JSONFile(join(__dirname, '../data/products.json')), { products: [] });
const auctionsDb = new Low(new JSONFile(join(__dirname, '../data/auctions.json')), { auctions: [] });
const bidsDb = new Low(new JSONFile(join(__dirname, '../data/bids.json')), { bids: [] });
const ordersDb = new Low(new JSONFile(join(__dirname, '../data/orders.json')), { orders: [] });

const ensureOrderForApprovedBid = async (bid) => {
  await ordersDb.read();
  const existingOrder = ordersDb.data.orders.find((o) => o.bidId === bid.id);
  if (existingOrder) return existingOrder;

  await auctionsDb.read();
  const auction = auctionsDb.data.auctions.find((a) => a.id === bid.auctionId);
  const order = {
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
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

  ordersDb.data.orders.push(order);
  await ordersDb.write();
  return order;
};

router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    await usersDb.read();
    await productsDb.read();
    await auctionsDb.read();
    await bidsDb.read();
    await ordersDb.read();

    const stats = {
      totalUsers: usersDb.data.users.length,
      totalBuyers: usersDb.data.users.filter((u) => u.role === 'buyer').length,
      totalFarmers: usersDb.data.users.filter((u) => u.role === 'farmer').length,
      totalProducts: productsDb.data.products.length,
      activeAuctions: auctionsDb.data.auctions.filter((a) => a.status === 'active').length,
      totalAuctions: auctionsDb.data.auctions.length,
      totalBids: bidsDb.data.bids.length,
      pendingBids: bidsDb.data.bids.filter((b) => b.status === 'pending').length,
      totalOrders: ordersDb.data.orders.length,
      totalRevenue: ordersDb.data.orders.reduce((sum, o) => sum + (o.totalValue || 0), 0),
      totalTonsTraded: ordersDb.data.orders.reduce((sum, o) => sum + (o.quantity || 0), 0)
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    await usersDb.read();
    const users = usersDb.data.users.map(({ password, ...user }) => user);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/verify', verifyToken, requireAdmin, async (req, res) => {
  try {
    await usersDb.read();
    const userIndex = usersDb.data.users.findIndex((u) => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    usersDb.data.users[userIndex].verified = typeof req.body?.verified === 'boolean' ? req.body.verified : true;
    await usersDb.write();
    res.json({ message: 'User verification updated.', user: usersDb.data.users[userIndex] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bids', verifyToken, requireAdmin, async (req, res) => {
  try {
    await bidsDb.read();
    res.json(bidsDb.data.bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/bids/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await bidsDb.read();
    const bidIndex = bidsDb.data.bids.findIndex((b) => b.id === req.params.id);
    if (bidIndex === -1) return res.status(404).json({ error: 'Bid not found' });

    bidsDb.data.bids[bidIndex] = {
      ...bidsDb.data.bids[bidIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await bidsDb.write();

    const bid = bidsDb.data.bids[bidIndex];
    let order = null;

    if (['approved', 'accepted'].includes(bid.status)) {
      order = await ensureOrderForApprovedBid(bid);
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

    res.json({ ...bid, orderId: order?.id || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', verifyToken, requireAdmin, async (req, res) => {
  try {
    await ordersDb.read();
    res.json(ordersDb.data.orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
