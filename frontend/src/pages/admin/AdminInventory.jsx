import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaWarehouse, FaPlus, FaPencil, FaTrash, FaCheck, FaXmark } from 'react-icons/fa6';

const EMPTY_FORM = {
  commodity: '', variety: '', grade: 'A', sku: '',
  basePricePerTon: '', availableTons: '', totalQuantityTons: '',
  warehouse: '', origin: '', status: 'available', auctionStatus: 'upcoming',
  description: '', harvestDate: '', expiryDate: '',
};

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = () => localStorage.getItem('vt_token');

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/inventory');
      setItems(res.data);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleSave = async () => {
    if (!form.commodity || !form.basePricePerTon || !form.availableTons) {
      return toast.error('Commodity, price, and quantity are required');
    }
    setSaving(true);
    try {
      if (editItem) {
        await axios.put(`/api/inventory/${editItem.id}`, form, { headers: { Authorization: `Bearer ${token()}` } });
        toast.success('Inventory item updated');
      } else {
        await axios.post('/api/inventory', form, { headers: { Authorization: `Bearer ${token()}` } });
        toast.success('Inventory item added');
      }
      await fetchItems();
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/inventory/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      toast.success('Item deleted');
      setItems(i => i.filter(x => x.id !== id));
      setDeleteConfirm(null);
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Inventory Management</h2>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>{items.length} items across all warehouses</p>
        </div>
        <button id="add-inventory-btn" onClick={openAdd} className="btn btn-primary">
          <FaPlus /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { l: 'Total Items', v: items.length, c: '#14B8A6' },
          { l: 'Available', v: items.filter(i => i.status === 'available').length, c: '#10B981' },
          { l: 'Live Auctions', v: items.filter(i => i.auctionStatus === 'active').length, c: '#F59E0B' },
          { l: 'Total Tons', v: items.reduce((s, i) => s + (Number(i.availableTons) || 0), 0).toLocaleString(), c: '#8B5CF6' },
        ].map(s => (
          <div key={s.l} className="metric-card">
            <div className="metric-value" style={{ color: s.c }}>{s.v}</div>
            <div className="metric-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Commodity</th>
                  <th>Grade</th>
                  <th>Available Tons</th>
                  <th>Base Price/Ton</th>
                  <th>Warehouse</th>
                  <th>Auction Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>{item.sku}</code></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.commodity}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.variety}</div>
                    </td>
                    <td><span className="badge badge-teal">{item.grade}</span></td>
                    <td>{item.availableTons} / {item.totalQuantityTons}</td>
                    <td style={{ fontWeight: 700, color: '#14B8A6' }}>₹{Number(item.basePricePerTon).toLocaleString()}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748B' }}>{item.warehouse}</td>
                    <td>
                      <span className={`badge ${item.auctionStatus === 'active' ? 'badge-teal' : item.auctionStatus === 'upcoming' ? 'badge-amber' : 'badge-neutral'}`}>
                        {item.auctionStatus}
                      </span>
                    </td>
                    <td>
                      {deleteConfirm === item.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button id={`confirm-delete-${item.id}`} onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger"><FaCheck /></button>
                          <button onClick={() => setDeleteConfirm(null)} className="btn btn-sm btn-glass"><FaXmark /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button id={`edit-item-${item.id}`} onClick={() => openEdit(item)} className="btn btn-sm btn-glass"><FaPencil /></button>
                          <button id={`delete-item-${item.id}`} onClick={() => setDeleteConfirm(item.id)} className="btn btn-sm btn-danger"><FaTrash /></button>
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card-strong" style={{ padding: '2rem', maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem' }}>
              {editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              {[
                { key: 'commodity', label: 'Commodity *', placeholder: 'e.g. Tomato' },
                { key: 'variety', label: 'Variety', placeholder: 'e.g. Hybrid Desi' },
                { key: 'sku', label: 'SKU', placeholder: 'e.g. TOM-GR-A-001' },
                { key: 'origin', label: 'Origin', placeholder: 'e.g. Nashik, MH' },
                { key: 'basePricePerTon', label: 'Base Price / Ton (₹) *', placeholder: '18000', type: 'number' },
                { key: 'availableTons', label: 'Available Tons *', placeholder: '500', type: 'number' },
                { key: 'totalQuantityTons', label: 'Total Quantity Tons', placeholder: '600', type: 'number' },
                { key: 'harvestDate', label: 'Harvest Date', type: 'date' },
                { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
              ].map(f => (
                <div className="form-group" key={f.key} style={{ gridColumn: f.key === 'warehouse' || f.key === 'description' ? 'span 2' : undefined }}>
                  <label>{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Warehouse *</label>
                <input value={form.warehouse || ''} onChange={e => setForm(x => ({ ...x, warehouse: e.target.value }))} placeholder="e.g. Nashik Cold Storage, MH" />
              </div>
              <div className="form-group">
                <label>Grade</label>
                <select value={form.grade} onChange={e => setForm(x => ({ ...x, grade: e.target.value }))}>
                  <option value="S (Super)">S (Super)</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div className="form-group">
                <label>Auction Status</label>
                <select value={form.auctionStatus} onChange={e => setForm(x => ({ ...x, auctionStatus: e.target.value }))}>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active (Live)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Description</label>
                <textarea value={form.description || ''} onChange={e => setForm(x => ({ ...x, description: e.target.value }))} rows={3} placeholder="Product description, certifications, notes..." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button id="save-inventory-btn" onClick={handleSave} disabled={saving} className="btn btn-primary btn-block">
                {saving ? 'Saving...' : editItem ? 'Update Item' : 'Add to Inventory'}
              </button>
              <button onClick={closeForm} className="btn btn-glass">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
