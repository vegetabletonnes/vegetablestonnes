import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('vt_token');
      const res = await axios.put('/api/auth/me', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The server returns a new token and user object
      if (res.data.token && res.data.user) {
        localStorage.setItem('vt_token', res.data.token);
        localStorage.setItem('vt_user', JSON.stringify(res.data.user));
        // Using context login to update the global state
        login(res.data.user, res.data.token);
      }
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ['Name', user.name],
    ['Email', user.email],
    ['Role', user.role],
    ['Company', user.company || 'N/A'],
    ['Phone', user.phone || 'N/A'],
    ['Location', user.location || 'N/A'],
    ['GSTIN', user.gstin || 'N/A'],
    ['PAN', user.pan || 'N/A'],
    ['Buyer ID', user.buyerId || 'N/A'],
    ['Farm Size', user.farmSize || 'N/A'],
    ['Verified', user.verified ? 'Yes' : 'No'],
  ];

  return (
    <div className="page-section">
      <div className="container" style={{ maxWidth: '860px' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              My Profile
            </h1>
            <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">
              Edit Profile
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {fields.map(([label, value]) => (
              <div key={label} style={{ background: 'rgba(20,184,166,0.06)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(20,184,166,0.12)' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                  {label}
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Montserrat, sans-serif', fontSize: '1.2rem' }}>Edit Profile</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-glass" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
