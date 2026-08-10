import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const bidsDb = new Low(new JSONFile(join(__dirname, '../data/bids.json')), { bids: [] });
const auctionsDb = new Low(new JSONFile(join(__dirname, '../data/auctions.json')), { auctions: [] });
const ordersDb = new Low(new JSONFile(join(__dirname, '../data/orders.json')), { orders: [] });
const usersDb = new Low(new JSONFile(join(__dirname, '../data/users.json')), { users: [] });

const buildOrderFromBid = (bid, auction) => ({
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
});

// POST /api/bids - place a bid
router.post('/', verifyToken, async (req, res) => {
  try {
    await bidsDb.read();
    await auctionsDb.read();
    await usersDb.read();

    const { auctionId, quantity, pricePerTon, destination, deliveryDate, remarks } = req.body;
    if (!auctionId || !quantity || !pricePerTon || !destination) {
      return res.status(400).json({ error: 'auctionId, quantity, pricePerTon, and destination are required.' });
    }

    const auction = auctionsDb.data.auctions.find((a) => a.id === auctionId);
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ error: 'Auction is not active' });

    const minimumBid = Math.max(Number(auction.basePrice || 0), Number(auction.currentHighestBid || 0) + 100);
    if (Number(pricePerTon) < minimumBid) {
      return res.status(400).json({ error: `Bid must be at least Rs.${minimumBid}/ton` });
    }
    if (Number(quantity) < Number(auction.minOrder)) {
      return res.status(400).json({ error: `Minimum order is ${auction.minOrder} tons` });
    }
    if (Number(quantity) > Number(auction.availableStock)) {
      return res.status(400).json({ error: `Only ${auction.availableStock} tons available` });
    }

    const user = usersDb.data.users.find((u) => u.id === req.user.id);
    const bid = {
      id: `bid-${uuidv4().slice(0, 8)}`,
      auctionId,
      buyerId: req.user.id,
      buyerName: user?.name || req.user.name,
      buyerCompany: user?.company || '',
      buyerGstin: user?.gstin || null,
      commodity: auction.productName,
      quantity: Number(quantity),
      pricePerTon: Number(pricePerTon),
      totalValue: Number(quantity) * Number(pricePerTon),
      destination,
      deliveryDate: deliveryDate || null,
      remarks: remarks || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    bidsDb.data.bids.push(bid);
    await bidsDb.write();

    const auctionIndex = auctionsDb.data.auctions.findIndex((a) => a.id === auctionId);
    if (Number(pricePerTon) > Number(auctionsDb.data.auctions[auctionIndex].currentHighestBid || 0)) {
      auctionsDb.data.auctions[auctionIndex].currentHighestBid = Number(pricePerTon);
    }
    auctionsDb.data.auctions[auctionIndex].totalBids += 1;
    await auctionsDb.write();

    createNotification(
      req.user.id,
      'bid_submitted',
      'Bid Submitted',
      `Your bid for ${auction.productName} has been submitted for review.`,
      { bidId: bid.id, auctionId }
    );
    createNotification(
      'admin-001',
      'bid_submitted',
      'New Bid Received',
      `${bid.buyerCompany || bid.buyerName} submitted a bid for ${auction.productName}.`,
      { bidId: bid.id, auctionId }
    );

    res.status(201).json({ message: 'Bid placed successfully!', bid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bids/mine
router.get('/mine', verifyToken, async (req, res) => {
  try {
    await bidsDb.read();
    const myBids = bidsDb.data.bids.filter((b) => b.buyerId === req.user.id);
    res.json(myBids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bids/farmer
router.get('/farmer', verifyToken, async (req, res) => {
  try {
    await bidsDb.read();
    await auctionsDb.read();
    const farmerAuctions = auctionsDb.data.auctions.filter((a) => a.farmerId === req.user.id).map((a) => a.id);
    const bids = bidsDb.data.bids.filter((b) => farmerAuctions.includes(b.auctionId));
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bids/:id/approve
router.put('/:id/approve', verifyToken, async (req, res) => {
  try {
    await bidsDb.read();
    await ordersDb.read();
    await auctionsDb.read();

    const bidIndex = bidsDb.data.bids.findIndex((b) => b.id === req.params.id);
    if (bidIndex === -1) return res.status(404).json({ error: 'Bid not found' });

    const bid = bidsDb.data.bids[bidIndex];
    bidsDb.data.bids[bidIndex].status = 'approved';
    bidsDb.data.bids[bidIndex].updatedAt = new Date().toISOString();
    await bidsDb.write();

    const auction = auctionsDb.data.auctions.find((a) => a.id === bid.auctionId);
    let order = ordersDb.data.orders.find((o) => o.bidId === bid.id);
    if (!order) {
      order = buildOrderFromBid(bid, auction);
      ordersDb.data.orders.push(order);
      await ordersDb.write();
    }

    createNotification(
      bid.buyerId,
      'bid_accepted',
      'Bid Accepted',
      `Your bid for ${order.commodity} was accepted. Order ${order.id} has been created.`,
      { bidId: bid.id, orderId: order.id }
    );

    res.json({ message: 'Bid approved! Order created.', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bids/:id/reject
router.put('/:id/reject', verifyToken, async (req, res) => {
  try {
    await bidsDb.read();
    const bidIndex = bidsDb.data.bids.findIndex((b) => b.id === req.params.id);
    if (bidIndex === -1) return res.status(404).json({ error: 'Bid not found' });

    bidsDb.data.bids[bidIndex].status = 'rejected';
    bidsDb.data.bids[bidIndex].updatedAt = new Date().toISOString();
    await bidsDb.write();

    createNotification(
      bidsDb.data.bids[bidIndex].buyerId,
      'bid_rejected',
      'Bid Rejected',
      `Your bid for ${bidsDb.data.bids[bidIndex].commodity || bidsDb.data.bids[bidIndex].auctionId} was rejected.`,
      { bidId: bidsDb.data.bids[bidIndex].id }
    );

    res.json({ message: 'Bid rejected.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
