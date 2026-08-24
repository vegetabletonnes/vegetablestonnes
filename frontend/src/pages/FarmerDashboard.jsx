import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatDisplayId } from '../utils/formatId';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [orders, setOrders] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      const [bidsRes, ordersRes, auctionsRes] = await Promise.all([
        axios.get('/api/bids/farmer'),
        axios.get('/api/orders/farmer'),
        axios.get('/api/auctions'),
      ]);
      setBids(bidsRes.data);
      setOrders(ordersRes.data);
      setAuctions(auctionsRes.data.filter(a => a.farmerId === user?.id));
    } catch (err) {
      toast.error('Failed to load farmer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBidAction = async (bidId, action) => {
    setActionLoading(bidId);
    try {
      await axios.put(`/api/bids/${bidId}/${action}`);
      toast.success(`Bid ${action}d successfully!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} bid`);
    } finally {
      setActionLoading(null);
    }
  };

  const totalRevenue = orders.filter(o => o.status !== 'rejected').reduce((s, o) => s + (o.totalValue || 0), 0);

  return (
    <div className="page-section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Profile Header */}
          <div className="glass-card" style={{
            padding: '1.75rem', marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.03) 100%)',
            border: '1px solid rgba(249,115,22,0.25)',
          }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>🌾</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>{user?.company}</h3>
                    <span className="badge badge-orange">🌾 Farmer</span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                    {user?.name} · Farm: {user?.farmSize || 'N/A'} · {user?.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {[
              { icon: '🌿', label: 'Active Auctions', value: auctions.filter(a => a.status === 'active').length, color: '#22c55e' },
              { icon: '🔨', label: 'Total Bids Received', value: bids.length, color: '#f97316' },
              { icon: '⏳', label: 'Pending Bids', value: bids.filter(b => b.status === 'pending').length, color: '#fbbf24' },
              { icon: '💰', label: 'Revenue Generated', value: `₹${(totalRevenue/100000).toFixed(1)}L`, color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* My Auctions */}
          {auctions.length > 0 && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem' }}>🏷️ My Active Listings</h3>
              <div className="grid-3">
                {auctions.map(a => (
                  <div key={a.id} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif' }}>{a.productName}</h4>
                      <span className={`badge ${a.status === 'active' ? 'badge-live' : 'badge-blue'}`}>{a.status}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '8px' }}>Stock: {a.availableStock} Tons left</div>
                    <div style={{ fontWeight: 700, color: '#22c55e', fontFamily: 'Outfit, sans-serif' }}>
                      ₹{a.currentHighestBid?.toLocaleString()}/Ton highest bid
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>{a.totalBids} bids received</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incoming Bids */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem' }}>📨 Incoming Bids — Approve or Reject</h3>
            {loading && <div className="spinner" />}
            {!loading && bids.length === 0 && (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No bids received yet. Contact admin to activate your auction.</p>
            )}
            {bids.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Bid ID</th>
                      <th>Buyer</th>
                      <th>Auction</th>
                      <th>Qty</th>
                      <th>Price/Ton</th>
                      <th>Total Value</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map(b => (
                      <tr key={b.id}>
                        <td><code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>{formatDisplayId('BID', b.id)}</code></td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{b.buyerCompany || b.buyerName}</div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#6b7280' }}>{formatDisplayId(b.productName, b.auctionId)}</td>
                        <td><strong>{b.quantity} Tons</strong></td>
                        <td style={{ color: '#22c55e', fontWeight: 700 }}>₹{b.pricePerTon?.toLocaleString()}</td>
                        <td style={{ fontWeight: 700 }}>₹{b.totalValue?.toLocaleString()}</td>
                        <td>
                          {b.status === 'pending' && <span className="badge badge-gold">⏳ Pending</span>}
                          {b.status === 'approved' && <span className="badge badge-green">✅ Approved</span>}
                          {b.status === 'rejected' && <span className="badge badge-red">❌ Rejected</span>}
                        </td>
                        <td>
                          {b.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleBidAction(b.id, 'approve')}
                                disabled={actionLoading === b.id}
                                className="btn btn-primary btn-sm"
                              >✅ Approve</button>
                              <button
                                onClick={() => handleBidAction(b.id, 'reject')}
                                disabled={actionLoading === b.id}
                                className="btn btn-sm btn-danger"
                              >❌ Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Orders */}
          {orders.length > 0 && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem' }}>📦 Fulfilled Orders</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Buyer</th>
                      <th>Commodity</th>
                      <th>Qty</th>
                      <th>Total Value</th>
                      <th>Status</th>
                      <th>Logistics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong style={{ color: '#22c55e' }}>{o.id}</strong></td>
                        <td>{o.buyerCompany}</td>
                        <td>{o.commodity}</td>
                        <td>{o.quantity} Tons</td>
                        <td style={{ fontWeight: 700 }}>₹{o.totalValue?.toLocaleString()}</td>
                        <td>
                          {o.status === 'approved' && <span className="badge badge-green">✅ Approved</span>}
                          {o.status === 'dispatched' && <span className="badge badge-blue">🚛 Dispatched</span>}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {o.vehicleNo ? (
                            <div>
                              <div style={{ color: '#059669', fontWeight: 600 }}>{o.vehicleNo}</div>
                              <div style={{ color: '#6b7280' }}>Driver: {o.driverPhone}</div>
                              {o.gatePassIssued && <span className="badge badge-blue" style={{ marginTop: '3px' }}>🎫 Gate Pass</span>}
                            </div>
                          ) : <span style={{ color: '#6b7280' }}>Awaiting buyer dispatch</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
