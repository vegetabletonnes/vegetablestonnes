import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBoxOpen, FaPlus, FaMagnifyingGlass, FaLocationDot, FaPenToSquare, FaTrash, FaXmark } from 'react-icons/fa6';

const CATEGORIES = ['Root Vegetables', 'Leafy Greens', 'Nightshades', 'Allium', 'Cruciferous', 'Gourds', 'Other'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Root Vegetables',
    image: '',
    farmerName: '',
    location: '',
    pricePerKg: '',
    totalTons: '',
    qualityGrade: 'A+',
    description: '',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Root Vegetables',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
      farmerName: 'GreenEarth Farms',
      location: 'Nashik, MH',
      pricePerKg: '25',
      totalTons: '50',
      qualityGrade: 'A+',
      description: 'Fresh farm harvest ready for wholesale distribution.',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      category: prod.category || 'Root Vegetables',
      image: prod.image || '',
      farmerName: prod.farmerName || '',
      location: prod.location || '',
      pricePerKg: prod.pricePerKg || '',
      totalTons: prod.totalTons || '',
      qualityGrade: prod.qualityGrade || 'A+',
      description: prod.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        pricePerKg: Number(formData.pricePerKg),
        totalTons: Number(formData.totalTons),
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', payload);
        toast.success('Product added successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                          p.farmerName?.toLowerCase().includes(search.toLowerCase()) ||
                          p.location?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBoxOpen style={{ color: '#22c55e' }} /> Farm Produce Catalog
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Company head inventory & farm harvest listings</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Add New Produce
        </button>
      </div>

      {/* Controls / Filters */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search product name, farmer, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          style={{ width: '200px' }}
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories ({products.length})</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="spinner" />
      ) : filteredProducts.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          No produce found matching your filters.
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(15,23,42,0.10)', color: '#047857', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '1rem' }}>Produce</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Farmer / Origin</th>
                <th style={{ padding: '1rem' }}>Available Tonnage</th>
                <th style={{ padding: '1rem' }}>Base Price</th>
                <th style={{ padding: '1rem' }}>Grade</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={p.image || 'https://via.placeholder.com/60'}
                        alt={p.name}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(15,23,42,0.12)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-gold">{p.category}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{p.farmerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaLocationDot style={{ color: '#22c55e' }} /> {p.location}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#22c55e' }}>
                    {p.totalTons} Tons
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#fbbf24' }}>
                    ₹{p.pricePerKg}/kg <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>(₹{p.pricePerKg * 1000}/ton)</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-live">{p.qualityGrade || 'A+'}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FaPenToSquare /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {editingProduct ? 'Edit Produce Listing' : 'Add New Farm Produce'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1.2rem', cursor: 'pointer' }}><FaXmark /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Produce Name</label>
                    <input
                      required
                      type="text"
                      className="input-field"
                      placeholder="e.g. Organic Hybrid Tomatoes"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Category</label>
                    <select
                      className="input-field"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Farmer Name / Farm Source</label>
                    <input
                      required
                      type="text"
                      className="input-field"
                      placeholder="e.g. Ramesh Patel Farm"
                      value={formData.farmerName}
                      onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Farm Origin Location</label>
                    <input
                      required
                      type="text"
                      className="input-field"
                      placeholder="e.g. Nashik, MH"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Price per KG (₹)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="25"
                      value={formData.pricePerKg}
                      onChange={e => setFormData({ ...formData, pricePerKg: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Total Tonnage</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="50"
                      value={formData.totalTons}
                      onChange={e => setFormData({ ...formData, totalTons: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Audited Grade</label>
                    <select
                      className="input-field"
                      value={formData.qualityGrade}
                      onChange={e => setFormData({ ...formData, qualityGrade: e.target.value })}
                    >
                      <option value="A+">Grade A+ (Export Quality)</option>
                      <option value="A">Grade A (Standard Commercial)</option>
                      <option value="B">Grade B (Processing Grade)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Image URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '4px' }}>Produce Specifications</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Produce specifications, organic certification details, packaging format..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-glass">Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingProduct ? 'Save Changes' : 'Create Produce Listing'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;