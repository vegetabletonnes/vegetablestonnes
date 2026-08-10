import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCreditCard, FaMobile, FaBuildingColumns, FaMoneyBillTransfer, FaShield, FaCheck } from 'react-icons/fa6';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: <FaMobile />, desc: 'Pay via Google Pay, PhonePe, BHIM', color: '#14B8A6' },
  { id: 'credit_card', label: 'Credit Card', icon: <FaCreditCard />, desc: 'Visa, Mastercard, RuPay', color: '#8B5CF6' },
  { id: 'debit_card', label: 'Debit Card', icon: <FaCreditCard />, desc: 'All major bank debit cards', color: '#3B82F6' },
  { id: 'net_banking', label: 'Net Banking', icon: <FaBuildingColumns />, desc: 'All major banks supported', color: '#F59E0B' },
  { id: 'neft_rtgs', label: 'NEFT / RTGS', icon: <FaMoneyBillTransfer />, desc: 'For large value transfers (>₹2L)', color: '#10B981' },
];

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const [method, setMethod] = useState('upi');
  const [stage, setStage] = useState('method'); // method | processing | success
  const [paymentId, setPaymentId] = useState(null);

  const handleInitiate = async () => {
    setStage('processing');
    try {
      const token = localStorage.getItem('vt_token');
      const res = await axios.post('/api/payments/initiate', { orderId: order.id, method }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentId(res.data.payment.id);
      // Simulate processing delay
      setTimeout(async () => {
        try {
          await axios.post('/api/payments/confirm', { paymentId: res.data.payment.id }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStage('success');
          toast.success('Payment successful!');
          setTimeout(() => { onSuccess(); onClose(); }, 2000);
        } catch (err) {
          toast.error(err.response?.data?.error || 'Payment confirmation failed');
          setStage('method');
        }
      }, 2500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment initiation failed');
      setStage('method');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-strong"
        style={{ padding: '2rem', maxWidth: 480, width: '100%' }}>

        {stage === 'processing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: '1rem', color: '#0f766e', fontWeight: 600 }}>Processing payment...</p>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>Do not close this window</p>
          </div>
        )}

        {stage === 'success' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)', border: '2px solid #10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', fontSize: '1.8rem', color: '#10B981',
            }}>
              <FaCheck />
            </div>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', color: '#10B981' }}>Payment Successful!</h3>
            <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '0.88rem' }}>
              ₹{order.totalValue?.toLocaleString()} paid for Order {order.id}
            </p>
          </div>
        )}

        {stage === 'method' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: '4px', color: '#0f172a' }}>Complete Payment</h3>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Order: <strong style={{ color: '#14B8A6' }}>{order.id}</strong> · {order.commodity} · {order.quantity} Tons
              </div>
              <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(20,184,166,0.08)', borderRadius: '10px', border: '1px solid rgba(20,184,166,0.18)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Total Amount</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#14B8A6' }}>
                  ₹{order.totalValue?.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Select Payment Method
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    id={`payment-method-${m.id}`}
                    onClick={() => setMethod(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.9rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      background: method === m.id ? `${m.color}15` : 'rgba(15,23,42,0.04)',
                      borderLeft: method === m.id ? `3px solid ${m.color}` : '3px solid transparent',
                      transition: 'all 0.18s',
                    }}
                  >
                    <div style={{ color: m.color, fontSize: '1.1rem', width: 24, textAlign: 'center' }}>{m.icon}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{m.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.desc}</div>
                    </div>
                    {method === m.id && (
                      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaCheck style={{ fontSize: '0.6rem', color: '#fff' }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748B', marginBottom: '1.25rem' }}>
              <FaShield style={{ color: '#10B981' }} /> 256-bit SSL encrypted. Your payment is secure.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button id="payment-pay-btn" onClick={handleInitiate} className="btn btn-primary btn-block">
                <FaCreditCard /> Pay ₹{order.totalValue?.toLocaleString()}
              </button>
              <button onClick={onClose} className="btn btn-glass">Cancel</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

const Payments = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('vt_token');
      const [ordersRes, paymentsRes] = await Promise.all([
        axios.get('/api/orders/mine', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/payments/mine', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setOrders(ordersRes.data);
      setPayments(paymentsRes.data);
    } catch {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingOrders = orders.filter(o => ['accepted', 'approved', 'payment_pending'].includes(o.status));
  const totalPaid = payments.filter(p => p.status === 'successful').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="page-section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-tag"><FaCreditCard /> Payments</span>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>Payments</h1>
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Pending Payments', value: pendingOrders.length, color: '#F59E0B' },
              { label: 'Total Paid', value: `₹${(totalPaid / 100000).toFixed(1)}L`, color: '#10B981' },
              { label: 'Transactions', value: payments.length, color: '#14B8A6' },
              { label: 'Successful', value: payments.filter(p => p.status === 'successful').length, color: '#8B5CF6' },
            ].map(s => (
              <div key={s.label} className="metric-card">
                <div className="metric-value" style={{ color: s.color }}>{s.value}</div>
                <div className="metric-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[{ key: 'pending', label: 'Pending Payments' }, { key: 'history', label: 'Payment History' }].map(t => (
              <button key={t.key} id={`payments-tab-${t.key}`} onClick={() => setActiveTab(t.key)}
                className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-glass'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? <div className="spinner" /> : activeTab === 'pending' ? (
            pendingOrders.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                <FaCheck style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10B981', opacity: 0.7 }} />
                <p>No pending payments. All caught up!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingOrders.map(order => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card" style={{ padding: '1.5rem' }}>
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#14B8A6' }}>{order.id}</div>
                        <div style={{ fontSize: '0.9rem', marginTop: '2px' }}>{order.commodity} · {order.quantity} Tons</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                          ₹{order.bidPrice?.toLocaleString()}/Ton · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
                            ₹{order.totalValue?.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Amount Due</div>
                        </div>
                        <button
                          id={`pay-btn-${order.id}`}
                          onClick={() => setSelectedOrder(order)}
                          className="btn btn-primary"
                        >
                          <FaCreditCard /> Pay Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No payment history yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Order ID</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Reference</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td><code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>{p.id}</code></td>
                          <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{p.orderId}</td>
                          <td style={{ textTransform: 'capitalize', color: '#0f172a' }}>{p.method?.replace('_', ' ')}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{p.amount?.toLocaleString()}</td>
                          <td><code style={{ color: '#F59E0B', fontSize: '0.78rem' }}>{p.reference}</code></td>
                          <td>
                            <span className={`badge ${p.status === 'successful' ? 'badge-green' : p.status === 'initiated' ? 'badge-amber' : 'badge-neutral'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {selectedOrder && (
        <PaymentModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onSuccess={fetchData} />
      )}
    </div>
  );
};

export default Payments;
