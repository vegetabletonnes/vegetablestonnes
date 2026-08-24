import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaGavel, FaCheck, FaXmark, FaArrowRightArrowLeft, FaCommentDots, FaChevronDown } from 'react-icons/fa6';
import { formatDisplayId } from '../../utils/formatId';

const STATUS_BADGE = {
  pending:        { cls: 'badge-amber',   label: 'Pending' },
  approved:       { cls: 'badge-green',   label: 'Accepted' },
  accepted:       { cls: 'badge-green',   label: 'Accepted' },
  rejected:       { cls: 'badge-red',     label: 'Rejected' },
  counter_offered:{ cls: 'badge-blue',    label: 'Counter Offered' },
};

const ActionModal = ({ bid, actionType, onClose, onSuccess }) => {
  const [counterPrice, setCounterPrice] = useState(bid.pricePerTon || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('vt_token');
      const payload = { status: actionType };
      if (actionType === 'counter_offered') { payload.counterPrice = Number(counterPrice); payload.counterNote = note; }
      if (actionType === 'clarification_requested') { payload.clarificationNote = note; }

      await axios.put(`/api/admin/bids/${bid.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const labels = {
        approved: 'Bid accepted! Order created.',
        rejected: 'Bid rejected.',
        counter_offered: 'Counter offer sent.',
        clarification_requested: 'Clarification requested.',
      };
      toast.success(labels[actionType] || 'Done');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const configs = {
    approved:               { title: 'Accept Bid', color: '#10B981', icon: <FaCheck />, btnLabel: 'Accept Bid', btnClass: 'btn-success' },
    rejected:               { title: 'Reject Bid', color: '#EF4444', icon: <FaXmark />, btnLabel: 'Reject Bid', btnClass: 'btn-danger' },
    counter_offered:        { title: 'Counter Offer', color: '#3B82F6', icon: <FaArrowRightArrowLeft />, btnLabel: 'Send Counter', btnClass: 'btn-primary' },
    clarification_requested:{ title: 'Request Clarification', color: '#F59E0B', icon: <FaCommentDots />, btnLabel: 'Send Request', btnClass: 'btn-amber' },
  };
  const cfg = configs[actionType] || configs.approved;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-card-strong" style={{ padding: '2rem', maxWidth: 440, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ color: cfg.color, fontSize: '1.2rem' }}>{cfg.icon}</div>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif' }}>{cfg.title}</h3>
        </div>

        <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: 1.7 }}>
          <div style={{ color: '#14B8A6', fontWeight: 700 }}>{bid.id}</div>
          <div>{bid.buyerName} · {bid.buyerCompany}</div>
          <div style={{ color: '#64748B' }}>{bid.quantity} Tons · ₹{bid.pricePerTon?.toLocaleString()}/Ton · Total ₹{bid.totalValue?.toLocaleString()}</div>
          {bid.destination && <div style={{ color: '#64748B' }}>Destination: {bid.destination}</div>}
        </div>

        {actionType === 'counter_offered' && (
          <div className="form-group">
            <label>Counter Price per Ton (₹)</label>
            <input type="number" value={counterPrice} onChange={e => setCounterPrice(e.target.value)}
              placeholder={`Original: ₹${bid.pricePerTon?.toLocaleString()}`} />
          </div>
        )}

        {['counter_offered', 'clarification_requested', 'rejected'].includes(actionType) && (
          <div className="form-group">
            <label>{actionType === 'rejected' ? 'Rejection Reason (optional)' : 'Message / Note'}</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add a message for the buyer..." rows={3}
              style={{ resize: 'vertical' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button id={`bid-action-confirm-btn`} onClick={handleSubmit} disabled={loading}
            className={`btn ${cfg.btnClass} btn-block`}>
            {loading ? 'Processing...' : cfg.btnLabel}
          </button>
          <button onClick={onClose} className="btn btn-glass">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
};

const AdminBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState(null);

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('vt_token');
      const res = await axios.get('/api/admin/bids', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBids(res.data);
    } catch {
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBids(); }, []);

  const openAction = (bid, type) => { setSelected(bid); setActionType(type); };

  const filtered = filter === 'all' ? bids : bids.filter(b => {
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'approved') return ['approved', 'accepted'].includes(b.status);
    if (filter === 'rejected') return b.status === 'rejected';
    if (filter === 'counter') return b.status === 'counter_offered';
    return true;
  });

  const pendingCount = bids.filter(b => b.status === 'pending').length;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Bid Review</h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
          {pendingCount > 0 ? <span style={{ color: '#F59E0B', fontWeight: 600 }}>{pendingCount} bids awaiting review</span> : 'All bids reviewed'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { l: 'Total Bids', v: bids.length, c: '#14B8A6' },
          { l: 'Pending', v: bids.filter(b => b.status === 'pending').length, c: '#F59E0B' },
          { l: 'Accepted', v: bids.filter(b => ['approved', 'accepted'].includes(b.status)).length, c: '#10B981' },
          { l: 'Total Value', v: `₹${(bids.reduce((s, b) => s + (b.totalValue || 0), 0) / 100000).toFixed(1)}L`, c: '#8B5CF6' },
        ].map(s => (
          <div key={s.l} className="metric-card">
            <div className="metric-value" style={{ color: s.c }}>{s.v}</div>
            <div className="metric-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { key: 'pending', label: 'Pending Review' },
          { key: 'all', label: 'All Bids' },
          { key: 'approved', label: 'Accepted' },
          { key: 'counter', label: 'Counter Offered' },
          { key: 'rejected', label: 'Rejected' },
        ].map(t => (
          <button key={t.key} id={`admin-bids-filter-${t.key}`} onClick={() => setFilter(t.key)}
            className={`btn btn-sm ${filter === t.key ? 'btn-primary' : 'btn-glass'}`}>
            {t.label}
            {t.key === 'pending' && pendingCount > 0 && (
              <span style={{ background: '#F59E0B', color: '#000', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bids Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No bids in this category.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Bid ID</th>
                  <th>Buyer</th>
                  <th>Auction</th>
                  <th>Qty (Tons)</th>
                  <th>Price/Ton</th>
                  <th>Total Value</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bid => {
                  const bs = STATUS_BADGE[bid.status] || { cls: 'badge-neutral', label: bid.status };
                  const isPending = bid.status === 'pending';
                  return (
                    <tr key={bid.id}>
                      <td><code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>{formatDisplayId('BID', bid.id)}</code></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{bid.buyerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{bid.buyerCompany || formatDisplayId(bid.buyerName, bid.buyerId)}</div>
                      </td>
                      <td>
                        <div style={{ color: '#0f172a', fontWeight: 600 }}>{bid.productName || 'Unknown Product'}</div>
                        <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{formatDisplayId(bid.productName, bid.auctionId)}</div>
                      </td>
                      <td style={{ color: '#0f172a' }}>{bid.quantity}</td>
                      <td style={{ color: '#0f172a' }}>₹{bid.pricePerTon?.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{bid.totalValue?.toLocaleString()}</td>
                      <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{bid.destination || '—'}</td>
                      <td>
                        <span className={`badge ${bs.cls}`}>{bs.label}</span>
                        {bid.counterPrice && (
                          <div style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: '2px' }}>
                            Counter: ₹{bid.counterPrice?.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            <button id={`bid-accept-${bid.id}`} onClick={() => openAction(bid, 'approved')} className="btn btn-sm btn-success" title="Accept">
                              <FaCheck />
                            </button>
                            <button id={`bid-counter-${bid.id}`} onClick={() => openAction(bid, 'counter_offered')} className="btn btn-sm btn-glass" title="Counter Offer" style={{ color: '#3B82F6', borderColor: 'rgba(59,130,246,0.3)' }}>
                              <FaArrowRightArrowLeft />
                            </button>
                            <button id={`bid-clarify-${bid.id}`} onClick={() => openAction(bid, 'clarification_requested')} className="btn btn-sm btn-glass" title="Request Clarification" style={{ color: '#F59E0B' }}>
                              <FaCommentDots />
                            </button>
                            <button id={`bid-reject-${bid.id}`} onClick={() => openAction(bid, 'rejected')} className="btn btn-sm btn-danger" title="Reject">
                              <FaXmark />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Reviewed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && actionType && (
        <ActionModal bid={selected} actionType={actionType} onClose={() => { setSelected(null); setActionType(null); }} onSuccess={fetchBids} />
      )}
    </div>
  );
};

export default AdminBids;