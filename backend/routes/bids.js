import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import supabase from '../db/supabase.js';

const router = express.Router();

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
    const { auctionId, quantity, pricePerTon, destination, deliveryDate, remarks } = req.body;
    if (!auctionId || !quantity || !pricePerTon || !destination) {
      return res.status(400).json({ error: 'auctionId, quantity, pricePerTon, and destination are required.' });
    }

    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    if (auction.status !== 'active') {
      return res.status(400).json({ error: 'Auction is not active' });
    }

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

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bid = {
      id: `bid-${uuidv4().slice(0, 8)}`,
      auctionId,
      buyerId: req.user.id,
      buyerName: user.name || req.user.name,
      buyerCompany: user.company || '',
      buyerGstin: user.gstin || null,
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

    const { error: insertError } = await supabase.from('bids').insert([bid]);
    if (insertError) throw insertError;

    const newHighestBid = Math.max(Number(pricePerTon), Number(auction.currentHighestBid || 0));
    const newTotalBids = (auction.totalBids || 0) + 1;
    
    const { error: updateAuctionError } = await supabase
      .from('auctions')
      .update({ 
        currentHighestBid: newHighestBid,
        totalBids: newTotalBids
      })
      .eq('id', auctionId);

    if (updateAuctionError) throw updateAuctionError;

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
    const { data: myBids, error } = await supabase
      .from('bids')
      .select('*')
      .eq('buyerId', req.user.id);

    if (error) throw error;
    res.json(myBids || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bids/farmer
router.get('/farmer', verifyToken, async (req, res) => {
  try {
    const { data: farmerAuctions, error: auctionsError } = await supabase
      .from('auctions')
      .select('id')
      .eq('farmerId', req.user.id);
      
    if (auctionsError) throw auctionsError;
    
    if (!farmerAuctions || farmerAuctions.length === 0) {
      return res.json([]);
    }

    const auctionIds = farmerAuctions.map(a => a.id);
    
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('*')
      .in('auctionId', auctionIds);

    if (bidsError) throw bidsError;
    res.json(bids || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bids/:id/approve
router.put('/:id/approve', verifyToken, async (req, res) => {
  try {
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (bidError || !bid) return res.status(404).json({ error: 'Bid not found' });

    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', bid.auctionId)
      .single();

    if (auctionError || !auction) return res.status(404).json({ error: 'Auction not found' });

    const { error: updateBidError } = await supabase
      .from('bids')
      .update({ 
        status: 'approved', 
        updatedAt: new Date().toISOString() 
      })
      .eq('id', bid.id);

    if (updateBidError) throw updateBidError;

    let { data: order, error: orderCheckError } = await supabase
      .from('orders')
      .select('*')
      .eq('bidId', bid.id)
      .maybeSingle();

    if (orderCheckError) throw orderCheckError;

    if (!order) {
      order = buildOrderFromBid(bid, auction);
      const { error: orderInsertError } = await supabase.from('orders').insert([order]);
      if (orderInsertError) throw orderInsertError;
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
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (bidError || !bid) return res.status(404).json({ error: 'Bid not found' });

    const { error: updateError } = await supabase
      .from('bids')
      .update({ 
        status: 'rejected',
        updatedAt: new Date().toISOString()
      })
      .eq('id', bid.id);

    if (updateError) throw updateError;

    createNotification(
      bid.buyerId,
      'bid_rejected',
      'Bid Rejected',
      `Your bid for ${bid.commodity || bid.auctionId} was rejected.`,
      { bidId: bid.id }
    );

    res.json({ message: 'Bid rejected.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
