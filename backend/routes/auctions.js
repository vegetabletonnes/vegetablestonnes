import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const auctionsDb = new Low(new JSONFile(join(__dirname, '../data/auctions.json')), { auctions: [] });
const bidsDb = new Low(new JSONFile(join(__dirname, '../data/bids.json')), { bids: [] });

// GET /api/auctions
router.get('/', async (req, res) => {
  try {
    await auctionsDb.read();
    const { status } = req.query;
    let auctions = auctionsDb.data.auctions;
    if (status) auctions = auctions.filter(a => a.status === status);
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auctions/:id
router.get('/:id', async (req, res) => {
  try {
    await auctionsDb.read();
    const auction = auctionsDb.data.auctions.find(a => a.id === req.params.id);
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auctions/:id/bids
router.get('/:id/bids', async (req, res) => {
  try {
    await bidsDb.read();
    const bids = bidsDb.data.bids.filter(b => b.auctionId === req.params.id);
    res.json(bids.sort((a, b) => b.pricePerTon - a.pricePerTon));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auctions (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    await auctionsDb.read();
    const auction = {
      id: `auc-${uuidv4().slice(0,8)}`,
      ...req.body,
      currentHighestBid: req.body.basePrice,
      totalBids: 0,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };
    auctionsDb.data.auctions.push(auction);
    await auctionsDb.write();
    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auctions/:id (admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await auctionsDb.read();
    const idx = auctionsDb.data.auctions.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Auction not found' });
    auctionsDb.data.auctions[idx] = { ...auctionsDb.data.auctions[idx], ...req.body, updatedAt: new Date().toISOString() };
    await auctionsDb.write();
    res.json(auctionsDb.data.auctions[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auctions/:id (admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await auctionsDb.read();
    const idx = auctionsDb.data.auctions.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Auction not found' });
    auctionsDb.data.auctions.splice(idx, 1);
    await auctionsDb.write();
    res.json({ message: 'Auction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
