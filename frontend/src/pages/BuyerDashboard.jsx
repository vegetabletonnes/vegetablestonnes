import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatDisplayId } from '../utils/formatId';
import { FaTruck, FaGavel, FaCheck, FaCoins, FaLocationDot, FaTicket, FaHourglass, FaXmark } from 'react-icons/fa6';

const VehicleModal = ({ order, onClose, onSuccess }) => {
  const [vehNo, setVehNo] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/orders/${order.id}/vehicle`, { vehicleNo: vehNo.toUpperCase(), driverPhone });
      toast.success(`Vehicle ${vehNo.toUpperCase()} assigned! Gate Pass Issued.`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-strong" style={{ padding: '2rem', maxWidth: '420px', width: '100%' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaTruck style={{ color: '#22c55e' }} /> Assign Pickup Vehicle
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Enter truck and driver details for Order <strong style={{ color: '#22c55e' }}>{order.id}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vehicle / Truck Number</label>
            <input type="text" value={vehNo} onChange={e => setVehNo(e.target.value)} placeholder="KA-01-EQ-9821" required />
          </div>
          <div className="form-group">
            <label>Driver Mobile Number</label>
            <input type="tel" value={driverPhone} onChange={e => setDriverPhone(e.target.value)} placeholder="+91 98765 43210" required />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} className="btn btn-orange btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FaTicket /> {loading ? 'Generating...' : 'Generate Gate Pass'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-glass btn-block">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    try {
      const [bidsRes, ordersRes] = await Promise.all([
        axios.get('/api/bids/mine'),
        axios.get('/api/orders/mine'),
      ]);
      setBids(bidsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statusBadge = {
    pending: <span className="badge badge-gold">Pending</span>,
    approved: <span className="badge badge-green">Approved</span>,
    rejected: <span className="badge badge-red">Rejected</span>,
    dispatched: <span className="badge badge-blue">Dispatched</span>,
  };

  const totalBidValue = bids.reduce((s, b) => s + b.totalValue, 0);
  const approvedOrders = orders.filter(o => o.status === 'approved' || o.status === 'dispatched');

  return (
    <div className="page-section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Profile Header */}
          <div className="glass-card" style={{
            padding: '1.75rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.03) 100%)',
            border: '1px solid rgba(34,197,94,0.25)',
          }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                  fontFamily: 'Outfit, sans-serif',
                }}>
                  {user?.name?.[0] || 'B'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>{user?.company || user?.name}</h3>
                    <span className="badge badge-green">Verified Buyer</span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                    {user?.name} · {user?.buyerId || user?.id} · GSTIN: {user?.gstin || 'N/A'}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Warehouse Location</div>
                <div style={{ color: '#047857', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <FaLocationDot style={{ color: '#22c55e' }} /> {user?.location || 'India'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {[
              { icon: <FaGavel />, label: 'Total Bids', value: bids.length, color: '#059669' },
              { icon: <FaCheck />, label: 'Approved Orders', value: approvedOrders.length, color: '#d97706' },
              { icon: <FaCoins />, label: 'Total Bid Value', value: `₹${(totalBidValue/100000).toFixed(1)}L`, color: '#ea580c' },
              { icon: <FaTruck />, label: 'Dispatched', value: orders.filter(o => o.status === 'dispatched').length, color: '#2563eb' },
            ].map((s, i) => (
              <div key={s.label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', color: s.color, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Orders Section */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', color: '#0f172a' }}>My Orders & Logistics</h3>
            {loading && <div className="spinner" />}
            {!loading && orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <p>No orders yet. Place bids in Live Auctions to get started!</p>
              </div>
            )}
            {orders.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Commodity</th>
                      <th>Qty</th>
                      <th>Price/Ton</th>
                      <th>Total Value</th>
                      <th>Status</th>
                      <th>Logistics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong style={{ color: '#059669' }}>{formatDisplayId(o.commodity, o.id)}</strong></td>
                        <td style={{ color: '#0f172a' }}>{o.commodity}</td>
                        <td style={{ color: '#0f172a' }}>{o.quantity} Tons</td>
                        <td style={{ color: '#0f172a' }}>₹{o.bidPrice?.toLocaleString()}/Ton</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{o.totalValue?.toLocaleString()}</td>
                        <td>{statusBadge[o.status] || o.status}</td>
                        <td>
                          {o.status === 'approved' && !o.vehicleNo && (
                            <button onClick={() => setSelectedOrder(o)} className="btn btn-orange btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <FaTruck /> Assign Vehicle
                            </button>
                          )}
                          {o.gatePassIssued && (
                            <div style={{ fontSize: '0.8rem' }}>
                              <div style={{ color: '#059669', fontWeight: 600 }}>{o.vehicleNo}</div>
                              <div style={{ color: '#6b7280' }}>Driver: {o.driverPhone}</div>
                              <span className="badge badge-blue" style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <FaTicket /> Gate Pass Issued
                              </span>
                            </div>
                          )}
                          {o.status === 'pending' && <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>Awaiting company approval</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bids Section */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', color: '#0f172a' }}>My Bid History</h3>
            {!loading && bids.length === 0 && (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '1.5rem' }}>No bids placed yet. Go to Live Auctions!</p>
            )}
            {bids.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Bid ID</th>
                      <th>Auction</th>
                      <th>Quantity</th>
                      <th>Price/Ton</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map(b => (
                      <tr key={b.id}>
                        <td><code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.82rem' }}>{formatDisplayId('BID', b.id)}</code></td>
                        <td>
                          <div style={{ color: '#0f172a', fontWeight: 600 }}>{b.productName || 'Unknown Product'}</div>
                          <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{formatDisplayId(b.productName, b.auctionId)}</div>
                        </td>
                        <td>{b.quantity} Tons</td>
                        <td>₹{b.pricePerTon?.toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>₹{b.totalValue?.toLocaleString()}</td>
                        <td>{statusBadge[b.status] || b.status}</td>
                        <td style={{ color: '#6b7280', fontSize: '0.82rem' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {selectedOrder && (
        <VehicleModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onSuccess={fetchData} />
      )}
    </div>
  );
};

export default BuyerDashboard;
