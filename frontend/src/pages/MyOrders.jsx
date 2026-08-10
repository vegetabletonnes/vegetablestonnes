import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaClipboardList, FaTruck, FaCircleCheck, FaCircleXmark, FaClock, FaReceipt } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const ORDER_LIFECYCLE = [
  'pending', 'accepted', 'payment_pending', 'payment_successful',
  'confirmed', 'preparing_dispatch', 'dispatched', 'delivered', 'completed',
];

const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending Review',
  accepted: 'Accepted',
  approved: 'Accepted',
  rejected: 'Rejected',
  counter_offered: 'Counter Offered',
  payment_pending: 'Payment Pending',
  payment_successful: 'Payment Done',
  confirmed: 'Confirmed',
  preparing_dispatch: 'Preparing Dispatch',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  completed: 'Completed',
};

const STATUS_BADGE = {
  pending:            'badge-amber',
  accepted:           'badge-green',
  approved:           'badge-green',
  rejected:           'badge-red',
  counter_offered:    'badge-blue',
  payment_pending:    'badge-amber',
  payment_successful: 'badge-teal',
  confirmed:          'badge-teal',
  preparing_dispatch: 'badge-purple',
  dispatched:         'badge-blue',
  delivered:          'badge-green',
  completed:          'badge-green',
};

const OrderTimeline = ({ status }) => {
  const currentIdx = ORDER_LIFECYCLE.indexOf(status);

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(20,184,166,0.04)', borderRadius: '10px', border: '1px solid rgba(20,184,166,0.10)' }}>
      <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Order Progress
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {ORDER_LIFECYCLE.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const color = done ? '#10B981' : active ? '#14B8A6' : 'rgba(255,255,255,0.15)';
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'flex-start', flex: i < ORDER_LIFECYCLE.length - 1 ? 1 : 'none', minWidth: 70 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: 60 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: done ? '#10B981' : active ? '#14B8A6' : 'rgba(255,255,255,0.08)',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', color: (done || active) ? '#fff' : '#64748B',
                  flexShrink: 0,
                  boxShadow: active ? '0 0 10px rgba(20,184,166,0.5)' : 'none',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: '0.58rem', color: active ? '#14B8A6' : done ? '#10B981' : '#64748B', textAlign: 'center', fontWeight: active ? 700 : 400, lineHeight: 1.2, maxWidth: 60 }}>
                  {STATUS_LABELS[s]}
                </div>
              </div>
              {i < ORDER_LIFECYCLE.length - 1 && (
                <div style={{
                  height: 2, flex: 1, marginTop: 10,
                  background: done ? '#10B981' : 'rgba(255,255,255,0.08)',
                  minWidth: 12,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('vt_token');
        const res = await axios.get('/api/orders/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => {
    if (filter === 'active') return ['pending', 'accepted', 'approved'].includes(o.status);
    if (filter === 'payment') return ['payment_pending', 'payment_successful'].includes(o.status);
    if (filter === 'dispatch') return ['confirmed', 'preparing_dispatch', 'dispatched'].includes(o.status);
    if (filter === 'completed') return ['delivered', 'completed'].includes(o.status);
    return true;
  });

  return (
    <div className="page-section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-tag"><FaClipboardList /> Order Management</span>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>My Orders</h1>
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Total Orders', value: orders.length, color: '#14B8A6', icon: <FaClipboardList /> },
              { label: 'Pending', value: orders.filter(o => ['pending', 'accepted', 'approved'].includes(o.status)).length, color: '#F59E0B', icon: <FaClock /> },
              { label: 'In Transit', value: orders.filter(o => ['dispatched', 'preparing_dispatch'].includes(o.status)).length, color: '#3B82F6', icon: <FaTruck /> },
              { label: 'Completed', value: orders.filter(o => ['delivered', 'completed'].includes(o.status)).length, color: '#10B981', icon: <FaCircleCheck /> },
            ].map(s => (
              <div key={s.label} className="metric-card">
                <div className="metric-icon" style={{ color: s.color }}>{s.icon}</div>
                <div className="metric-value" style={{ color: s.color }}>{s.value}</div>
                <div className="metric-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'active', label: 'Active' },
              { key: 'payment', label: 'Payment' },
              { key: 'dispatch', label: 'Dispatch' },
              { key: 'completed', label: 'Completed' },
            ].map(t => (
              <button key={t.key} id={`orders-filter-${t.key}`} onClick={() => setFilter(t.key)}
                className={`btn btn-sm ${filter === t.key ? 'btn-primary' : 'btn-glass'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Orders */}
          {loading ? <div className="spinner" /> : filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              <FaClipboardList style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }} />
              <p>No orders here yet.</p>
              <Link to="/auctions" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Auctions</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card"
                  style={{ padding: '1.5rem', cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#14B8A6' }}>{order.id}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{order.commodity}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{order.quantity} Tons · ₹{order.bidPrice?.toLocaleString()}/Ton</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
                          ₹{order.totalValue?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Value</div>
                      </div>
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-neutral'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      {order.invoiceId && (
                        <Link to={`/invoices/${order.invoiceId}`} className="btn btn-glass btn-sm"
                          onClick={e => e.stopPropagation()} id={`order-invoice-btn-${order.id}`}>
                          <FaReceipt /> Invoice
                        </Link>
                      )}
                      {['payment_pending'].includes(order.status) && (
                        <Link to="/payments" className="btn btn-primary btn-sm"
                          onClick={e => e.stopPropagation()} id={`order-pay-btn-${order.id}`}>
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Expanded Timeline */}
                  {expanded === order.id && (
                    <OrderTimeline status={order.status === 'approved' ? 'accepted' : order.status} />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrders;
