import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaGavel, FaRocket, FaLocationDot, FaPlay, FaStop, FaTrash, FaXmark } from 'react-icons/fa6';

const AdminAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    farmerName: '',
    location: '',
    availableStock: '',
    basePrice: '',
    minOrder: '5',
    qualityGrade: 'A+',
    durationHours: '24',
    image: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aucRes, prodRes] = await Promise.all([
        axios.get('/api/auctions'),
        axios.get('/api/products')
      ]);
      setAuctions(aucRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      toast.error('Failed to load auctions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setFormData(prev => ({
        ...prev,
        productId: prod.id,
        productName: prod.name,
        farmerName: prod.farmerName,
        location: prod.location,
        availableStock: prod.totalTons,
        basePrice: (prod.pricePerKg * 1000).toString(),
        qualityGrade: prod.qualityGrade || 'A+',
        image: prod.image,
      }));
    } else {
      setFormData(prev => ({ ...prev, productId: prodId }));
    }
  };

  const handleOpenAddModal = () => {
    setEditingAuction(null);
    setFormData({
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      farmerName: products[0]?.farmerName || 'Agri Gold Cooperatives',
      location: products[0]?.location || 'Nashik, MH',
      availableStock: products[0]?.totalTons || '40',
      basePrice: products[0] ? (products[0].pricePerKg * 1000).toString() : '22000',
      minOrder: '5',
      qualityGrade: 'A+',
      durationHours: '24',
      image: products[0]?.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endTime = new Date(Date.now() + Number(formData.durationHours) * 3600 * 1000).toISOString();
      const payload = {
        productId: formData.productId,
        productName: formData.productName,
        farmerName: formData.farmerName,
        location: formData.location,
        availableStock: Number(formData.availableStock),
        basePrice: Number(formData.basePrice),
        minOrder: Number(formData.minOrder),
        qualityGrade: formData.qualityGrade,
        image: formData.image,
        endTime,
      };

      if (editingAuction) {
        await axios.put(`/api/auctions/${editingAuction.id}`, payload);
        toast.success('Auction updated');
      } else {
        await axios.post('/api/auctions', { ...payload, status: 'active' });
        toast.success('New live auction created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save auction');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/auctions/${id}`, { status: newStatus });
      toast.success(`Auction status set to ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete auction for ${name}?`)) return;
    try {
      await axios.delete(`/api/auctions/${id}`);
      toast.success('Auction deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete auction');
    }
  };

  const filteredAuctions = auctions.filter(a => !statusFilter || a.status === statusFilter);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaGavel style={{ color: '#22c55e' }} /> Auctions Management
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Create, launch, and manage produce auctions</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaRocket /> Create Live Auction
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>Filter by Status:</span>
        {['', 'active', 'upcoming', 'closed'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className="btn btn-sm"
            style={{
              background: statusFilter === st ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)',
              border: statusFilter === st ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: statusFilter === st ? '#22c55e' : '#9ca3af',
              textTransform: 'capitalize',
            }}
          >
            {st === '' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="spinner" />
      ) : filteredAuctions.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          No auctions found.
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(15,23,42,0.10)', color: '#047857', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '1rem' }}>Commodity</th>
                <th style={{ padding: '1rem' }}>Farm Source</th>
                <th style={{ padding: '1rem' }}>Stock Available</th>
                <th style={{ padding: '1rem' }}>Base Price</th>
                <th style={{ padding: '1rem' }}>Highest Bid</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuctions.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={a.image || 'https://via.placeholder.com/60'} alt={a.productName} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{a.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{a.farmerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaLocationDot style={{ color: '#22c55e' }} /> {a.location}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#22c55e' }}>
                    {a.availableStock} Tons
                  </td>
                  <td style={{ padding: '1rem', color: '#9ca3af' }}>
                    ₹{a.basePrice?.toLocaleString()}/ton
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#fbbf24' }}>
                    ₹{a.currentHighestBid?.toLocaleString()}/ton
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.totalBids || 0} bids placed</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${a.status === 'active' ? 'badge-live' : a.status === 'upcoming' ? 'badge-gold' : 'badge-neutral'}`}>
                      {a.status === 'active' ? 'LIVE' : a.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {a.status !== 'active' && (
                        <button onClick={() => handleStatusChange(a.id, 'active')} style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaPlay /> Start
                        </button>
                      )}
                      {a.status === 'active' && (
                        <button onClick={() => handleStatusChange(a.id, 'closed')} style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaStop /> Close
                        </button>
                      )}
                      <button onClick={() => handleDelete(a.id, a.productName)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>Create New Auction</h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1.2rem', cursor: 'pointer' }}><FaXmark /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Select Produce from Inventory</label>
                  <select className="input-field" value={formData.productId} onChange={handleProductSelect}>
                    <option value="">-- Custom Auction --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.farmerName} - {p.totalTons} Tons)</option>)}
                  </select>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Commodity Name</label>
                    <input required type="text" className="input-field" value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Farm Source</label>
                    <input required type="text" className="input-field" value={formData.farmerName} onChange={e => setFormData({ ...formData, farmerName: e.target.value })} />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Base Price (₹ / Ton)</label>
                    <input required type="number" className="input-field" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Quantity Available (Tons)</label>
                    <input required type="number" className="input-field" value={formData.availableStock} onChange={e => setFormData({ ...formData, availableStock: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Min Order (Tons)</label>
                    <input required type="number" className="input-field" value={formData.minOrder} onChange={e => setFormData({ ...formData, minOrder: e.target.value })} />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Auction Duration (Hours)</label>
                    <select className="input-field" value={formData.durationHours} onChange={e => setFormData({ ...formData, durationHours: e.target.value })}>
                      <option value="6">6 Hours</option>
                      <option value="12">12 Hours</option>
                      <option value="24">24 Hours (1 Day)</option>
                      <option value="48">48 Hours (2 Days)</option>
                      <option value="72">72 Hours (3 Days)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Location</label>
                    <input required type="text" className="input-field" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-glass">Cancel</button>
                  <button type="submit" className="btn btn-primary">Launch Auction</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAuctions;