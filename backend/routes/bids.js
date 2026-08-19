import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import supabase from '../db/supabase.js';
import { mapRowsToCamel, mapRowToCamel } from '../utils/transform.js';

const router = express.Router();

// POST /api/bids
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

    if (auctionError || !auction) return res.status(404).json({ error: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ error: 'Auction is not active' });

    const minimumBid = Number(auction.base_price || 0);
    if (Number(pricePerTon) < minimumBid) {
      return res.status(400).json({ error: `Bid must be at least Rs.${minimumBid}/ton` });
    }
    if (Number(quantity) < Number(auction.min_order)) {
      return res.status(400).json({ error: `Minimum order is ${auction.min_order} tons` });
    }
    if (Number(quantity) > Number(auction.available_stock)) {
      return res.status(400).json({ error: `Only ${auction.available_stock} tons available` });
    }

    const bid = {
      auction_id: auctionId,
      buyer_id: req.user.id,
      quantity: Number(quantity),
      price_per_ton: Number(pricePerTon),
      total_value: Number(quantity) * Number(pricePerTon),
      destination,
      delivery_date: deliveryDate || null,
      remarks: remarks || '',
      status: 'pending',
    };

    const { data: inserted, error: insertError } = await supabase
      .from('bids')
      .insert([bid])
      .select()
      .single();

    if (insertError) throw insertError;

    const newHighestBid = Math.max(Number(pricePerTon), Number(auction.current_highest_bid || 0));
    await supabase
      .from('auctions')
      .update({ current_highest_bid: newHighestBid })
      .eq('id', auctionId);

    createNotification(
      req.user.id,
      'bid_submitted',
      'Bid Submitted',
      'Your bid has been submitted for review.',
      { bidId: inserted.id, auctionId }
    );

    res.status(201).json({ message: 'Bid placed successfully!', bid: mapRowToCamel(inserted) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data: myBids, error } = await supabase
      .from('bids')
      .select('*')
      .eq('buyer_id', req.user.id);

    if (error) throw error;
    
    // Enrich with productName
    const enrichedBids = await Promise.all((myBids || []).map(async (bid) => {
      const { data: auction } = await supabase.from('auctions').select('product_id').eq('id', bid.auction_id).single();
      let productName = 'Unknown Product';
      if (auction?.product_id) {
        const { data: product } = await supabase.from('products').select('name').eq('id', auction.product_id).single();
        if (product) productName = product.name;
      }
      return { ...bid, product_name: productName };
    }));

    res.json(mapRowsToCamel(enrichedBids));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/farmer', verifyToken, async (req, res) => {
  try {
    const { data: farmerAuctions, error: auctionsError } = await supabase
      .from('auctions')
      .select('id')
      .eq('farmer_id', req.user.id);

    if (auctionsError) throw auctionsError;
    if (!farmerAuctions?.length) return res.json([]);

    const auctionIds = farmerAuctions.map((a) => a.id);
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('*')
      .in('auction_id', auctionIds);

    if (bidsError) throw bidsError;
    
    // Enrich with productName
    const enrichedBids = await Promise.all((bids || []).map(async (bid) => {
      const { data: auction } = await supabase.from('auctions').select('product_id').eq('id', bid.auction_id).single();
      let productName = 'Unknown Product';
      if (auction?.product_id) {
        const { data: product } = await supabase.from('products').select('name').eq('id', auction.product_id).single();
        if (product) productName = product.name;
      }
      return { ...bid, product_name: productName };
    }));

    res.json(mapRowsToCamel(enrichedBids));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
