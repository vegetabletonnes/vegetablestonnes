import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaCreditCard,
  FaMobile,
  FaBuildingColumns,
  FaMoneyBillTransfer,
  FaShield,
  FaCheck,
  FaBolt,
  FaArrowRight,
  FaReceipt,
  FaSpinner,
} from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { openRazorpayCheckout } from '../utils/razorpay';
import { Link } from 'react-router-dom';

const PAYMENT_METHODS = [
  {
    id: 'razorpay',
    label: 'Razorpay Secure Checkout',
    icon: <FaBolt />,
    desc: 'Pay via UPI, Cards, NetBanking, Wallets (Instant Verification)',
    color: '#14B8A6',
    popular: true,
  },
  {
    id: 'upi',
    label: 'UPI Direct',
    icon: <FaMobile />,
    desc: 'Google Pay, PhonePe, Paytm, BHIM UPI',
    color: '#8B5CF6',
  },
  {
    id: 'credit_card',
    label: 'Credit / Debit Cards',
    icon: <FaCreditCard />,
    desc: 'Visa, MasterCard, RuPay, Corporate Cards',
    color: '#3B82F6',
  },
  {
    id: 'net_banking',
    label: 'Corporate Net Banking',
    icon: <FaBuildingColumns />,
    desc: 'SBI, HDFC, ICICI, Axis & 50+ Banks',
    color: '#F59E0B',
  },
  {
    id: 'neft_rtgs',
    label: 'NEFT / RTGS Transfer',
    icon: <FaMoneyBillTransfer />,
    desc: 'For high-value bulk transfers (> ₹2 Lakhs)',
    color: '#10B981',
  },
];

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [method, setMethod] = useState('razorpay');
  const [stage, setStage] = useState('method'); // method | processing | success
  const [verifiedPayment, setVerifiedPayment] = useState(null);

  const handlePay = async () => {
    if (method === 'razorpay' || method === 'upi' || method === 'credit_card' || method === 'net_banking') {
      // Launch standard Razorpay Web Checkout
      openRazorpayCheckout({
        amountInRupees: order.totalValue || order.amount,
        orderId: order.id,
        commodity: order.commodity,
        user,
        onSuccess: (data) => {
          setVerifiedPayment(data);
          setStage('success');
          onSuccess();
        },
        onError: (err) => {
          console.error('Payment failed/error:', err);
        },
        onDismiss: () => {
          console.log('Payment modal dismissed by user');
        },
      });
    } else {
      // Fallback manual / NEFT workflow
      setStage('processing');
      try {
        const token = localStorage.getItem('vt_token');
        const res = await axios.post(
          '/api/payments/initiate',
          { orderId: order.id, method },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTimeout(async () => {
          try {
            await axios.post(
              '/api/payments/confirm',
              { paymentId: res.data.payment.id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setStage('success');
            toast.success('Payment recorded successfully!');
            onSuccess();
          } catch (err) {
            toast.error(err.response?.data?.error || 'Payment confirmation failed');
            setStage('method');
          }
        }, 1500);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Payment initiation failed');
        setStage('method');
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card-strong"
        style={{ padding: '2rem', maxWidth: 500, width: '100%' }}
      >
        {stage === 'processing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: '1rem', color: '#0f766e', fontWeight: 600 }}>
              Initiating secure transfer...
            </p>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
              Do not close this window
            </p>
          </div>
        )}

        {stage === 'success' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                border: '2px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.8rem',
                color: '#10B981',
              }}
            >
              <FaCheck />
            </div>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', color: '#10B981' }}>
              Payment Verified!
            </h3>
            <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '0.88rem' }}>
              ₹{(order.totalValue || order.amount)?.toLocaleString()} successfully paid for Order {order.id}
            </p>
            {verifiedPayment?.payment_id && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem',
                  background: 'rgba(20,184,166,0.08)',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: '#0f766e',
                }}
              >
                Razorpay ID: <code>{verifiedPayment.payment_id}</code>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              {verifiedPayment?.invoice?.id && (
                <Link
                  to={`/invoices/${verifiedPayment.invoice.id}`}
                  className="btn btn-glass btn-block"
                  style={{ textDecoration: 'none' }}
                >
                  <FaReceipt /> View Invoice
                </Link>
              )}
              <button onClick={onClose} className="btn btn-primary btn-block">
                Done
              </button>
            </div>
          </div>
        )}

        {stage === 'method' && (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  marginBottom: '4px',
                  color: '#0f172a',
                }}
              >
                Complete Order Payment
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Order: <strong style={{ color: '#14B8A6' }}>{order.id}</strong> · {order.commodity} · {order.quantity} Tons
              </div>
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(20,184,166,0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(20,184,166,0.18)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Total Amount to Pay</div>
                <div
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: '#14B8A6',
                  }}
                >
                  ₹{(order.totalValue || order.amount)?.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0f766e',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Payment Method
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 240, overflowY: 'auto' }}>
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    id={`payment-method-${m.id}`}
                    onClick={() => setMethod(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      background: method === m.id ? `${m.color}18` : 'rgba(15,23,42,0.04)',
                      borderLeft: method === m.id ? `3px solid ${m.color}` : '3px solid transparent',
                      transition: 'all 0.18s',
                    }}
                  >
                    <div
                      style={{
                        color: m.color,
                        fontSize: '1.1rem',
                        width: 24,
                        textAlign: 'center',
                      }}
                    >
                      {m.icon}
                    </div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {m.label}
                        {m.popular && (
                          <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            Recommended
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{m.desc}</div>
                    </div>
                    {method === m.id && (
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: m.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FaCheck style={{ fontSize: '0.6rem', color: '#fff' }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: '#64748B',
                marginBottom: '1.25rem',
              }}
            >
              <FaShield style={{ color: '#10B981' }} /> 256-bit SSL encrypted · Razorpay Standard Checkout
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                id="payment-pay-btn"
                onClick={handlePay}
                className="btn btn-primary btn-block"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FaBolt /> Pay ₹{(order.totalValue || order.amount)?.toLocaleString()} with Razorpay
              </button>
              <button onClick={onClose} className="btn btn-glass">
                Cancel
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

const Payments = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchData();
  }, []);

  const pendingOrders = orders.filter((o) =>
    ['accepted', 'approved', 'payment_pending'].includes(o.status)
  );
  const totalPaid = payments
    .filter((p) => p.status === 'successful' || p.status === 'completed')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const handleInstantRazorpay = (order) => {
    openRazorpayCheckout({
      amountInRupees: order.totalValue || order.amount,
      orderId: order.id,
      commodity: order.commodity,
      user,
      onSuccess: () => {
        fetchData();
      },
    });
  };

  return (
    <div className="page-section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-tag">
              <FaCreditCard /> Payments & Checkout
            </span>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              Payments Portal
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
              Secure online payments powered by Razorpay Standard Web Checkout
            </p>
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Pending Payments', value: pendingOrders.length, color: '#F59E0B' },
              { label: 'Total Paid', value: `₹${(totalPaid / 100000).toFixed(1)}L`, color: '#10B981' },
              { label: 'Transactions', value: payments.length, color: '#14B8A6' },
              {
                label: 'Successful',
                value: payments.filter((p) => p.status === 'successful' || p.status === 'completed').length,
                color: '#8B5CF6',
              },
            ].map((s) => (
              <div key={s.label} className="metric-card">
                <div className="metric-value" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="metric-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[
              { key: 'pending', label: `Pending Payments (${pendingOrders.length})` },
              { key: 'history', label: `Payment History (${payments.length})` },
            ].map((t) => (
              <button
                key={t.key}
                id={`payments-tab-${t.key}`}
                onClick={() => setActiveTab(t.key)}
                className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-glass'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="spinner" />
          ) : activeTab === 'pending' ? (
            pendingOrders.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                <FaCheck style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10B981', opacity: 0.7 }} />
                <p>No pending payments. All orders are settled!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: '1.5rem' }}
                  >
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#14B8A6' }}>
                          Order #{order.id}
                        </div>
                        <div style={{ fontSize: '0.9rem', marginTop: '2px', fontWeight: 600 }}>
                          {order.commodity} · {order.quantity} Tons
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                          ₹{order.bidPrice?.toLocaleString()}/Ton · Date:{' '}
                          {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              fontFamily: 'Montserrat, sans-serif',
                              fontWeight: 800,
                              fontSize: '1.3rem',
                              color: '#0f172a',
                            }}
                          >
                            ₹{(order.totalValue || order.amount)?.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Amount Payable</div>
                        </div>
                        <button
                          id={`pay-razorpay-btn-${order.id}`}
                          onClick={() => handleInstantRazorpay(order)}
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FaBolt /> Pay with Razorpay
                        </button>
                        <button
                          id={`pay-options-btn-${order.id}`}
                          onClick={() => setSelectedOrder(order)}
                          className="btn btn-glass"
                        >
                          More Options
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
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                  No payment history yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Order ID</th>
                        <th>Method / Gateway</th>
                        <th>Amount</th>
                        <th>Reference / TXN ID</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>
                              {p.id?.slice(0, 12)}
                            </code>
                          </td>
                          <td style={{ color: '#64748B', fontSize: '0.82rem' }}>
                            {p.orderId?.slice(0, 12)}
                          </td>
                          <td style={{ textTransform: 'capitalize', color: '#0f172a' }}>
                            {p.method === 'razorpay' ? (
                              <span style={{ color: '#14B8A6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaBolt /> Razorpay
                              </span>
                            ) : (
                              p.method?.replace('_', ' ') || 'Online'
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            ₹{Number(p.amount)?.toLocaleString()}
                          </td>
                          <td>
                            <code style={{ color: '#F59E0B', fontSize: '0.78rem' }}>
                              {p.reference || '—'}
                            </code>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                p.status === 'successful' || p.status === 'completed'
                                  ? 'badge-green'
                                  : p.status === 'initiated' || p.status === 'pending'
                                  ? 'badge-amber'
                                  : 'badge-neutral'
                              }`}
                            >
                              {p.status === 'completed' ? 'successful' : p.status}
                            </span>
                          </td>
                          <td style={{ color: '#64748B', fontSize: '0.8rem' }}>
                            {new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN')}
                          </td>
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
        <PaymentModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default Payments;
