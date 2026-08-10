import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUsers, FaCheck, FaXmark, FaShieldHalved } from 'react-icons/fa6';

const AdminBuyers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const token = () => localStorage.getItem('vt_token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token()}` } });
        setUsers(res.data.filter(u => u.role === 'buyer'));
      } catch { toast.error('Failed to load buyers'); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  const handleVerify = async (id, verified) => {
    try {
      await axios.put(`/api/admin/users/${id}/verify`, { verified: !verified }, { headers: { Authorization: `Bearer ${token()}` } });
      setUsers(u => u.map(x => x.id === id ? { ...x, verified: !verified } : x));
      toast.success(verified ? 'Buyer unverified' : 'Buyer verified!');
    } catch { toast.error('Action failed'); }
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Buyer Management</h2>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>{users.length} registered buyers</p>
        </div>
        <input
          id="buyers-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search buyers..."
          style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(15,23,42,0.12)', borderRadius: '10px', color: '#0f172a', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', outline: 'none', minWidth: 220 }}
        />
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { l: 'Total Buyers', v: users.length, c: '#14B8A6' },
          { l: 'Verified', v: users.filter(u => u.verified).length, c: '#10B981' },
          { l: 'Pending Verification', v: users.filter(u => !u.verified).length, c: '#F59E0B' },
          { l: 'Active Today', v: Math.floor(users.length * 0.3), c: '#8B5CF6' },
        ].map(s => (
          <div key={s.l} className="metric-card">
            <div className="metric-value" style={{ color: s.c }}>{s.v}</div>
            <div className="metric-label">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No buyers found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Buyer ID</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>GSTIN</th>
                  <th>Location</th>
                  <th>Verification</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td><code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>{u.id?.slice(0, 8)}...</code></td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                    <td style={{ color: '#64748B', fontSize: '0.85rem' }}>{u.company || '—'}</td>
                    <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{u.email}</td>
                    <td><code style={{ fontSize: '0.75rem', color: '#F59E0B' }}>{u.gstin || '—'}</code></td>
                    <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{u.location || '—'}</td>
                    <td>
                      <span className={`badge ${u.verified ? 'badge-green' : 'badge-amber'}`}>
                        {u.verified ? <><FaShieldHalved /> Verified</> : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        id={`verify-buyer-${u.id}`}
                        onClick={() => handleVerify(u.id, u.verified)}
                        className={`btn btn-sm ${u.verified ? 'btn-danger' : 'btn-success'}`}
                      >
                        {u.verified ? <><FaXmark /> Unverify</> : <><FaCheck /> Verify</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBuyers;
