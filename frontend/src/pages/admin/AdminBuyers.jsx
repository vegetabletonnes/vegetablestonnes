import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUsers, FaCheck, FaXmark, FaShieldHalved, FaClock } from 'react-icons/fa6';

const AdminBuyers = () => {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('pending');

  const token = () => localStorage.getItem('vt_token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, pendingRes] = await Promise.all([
        axios.get('/api/admin/users', { headers: headers() }),
        axios.get('/api/admin/registrations/pending', { headers: headers() }),
      ]);
      setUsers((usersRes.data || []).filter((u) => u.role === 'buyer'));
      setPending(pendingRes.data || []);
    } catch {
      toast.error('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id, name) => {
    try {
      const res = await axios.put(`/api/admin/users/${id}/verify`, { approve: true }, { headers: headers() });
      toast.success(`Approved ${name}! Buyer ID: ${res.data.buyerIdRef || res.data.user?.buyerIdRef}`);
      fetchAll();
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject registration for ${name}?`)) return;
    try {
      await axios.put(`/api/admin/users/${id}/verify`, { reject: true }, { headers: headers() });
      toast.success('Registration rejected');
      fetchAll();
    } catch {
      toast.error('Rejection failed');
    }
  };

  const list = tab === 'pending' ? pending : users;
  const filtered = list.filter((u) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Buyer Management</h2>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
            {pending.length} pending · {users.filter((u) => u.verified).length} approved buyers
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buyers..."
          style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(15,23,42,0.12)', borderRadius: '10px', color: '#0f172a', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', outline: 'none', minWidth: 220 }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setTab('pending')}
          className={`btn btn-sm ${tab === 'pending' ? 'btn-primary' : 'btn-glass'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FaClock /> Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab('all')}
          className={`btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-glass'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FaUsers /> All Buyers ({users.length})
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { l: 'Total Buyers', v: users.length, c: '#14B8A6' },
          { l: 'Pending Approval', v: pending.length, c: '#F59E0B' },
          { l: 'Verified', v: users.filter((u) => u.verified).length, c: '#10B981' },
          { l: 'Rejected', v: users.filter((u) => u.registrationStatus === 'rejected').length, c: '#EF4444' },
        ].map((s) => (
          <div key={s.l} className="metric-card">
            <div className="metric-value" style={{ color: s.c }}>{s.v}</div>
            <div className="metric-label">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            {tab === 'pending' ? 'No pending registrations.' : 'No buyers found.'}
          </div>
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
                  <th>PAN</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>
                        {u.buyerIdRef || '—'}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                    <td style={{ color: '#64748B', fontSize: '0.85rem' }}>{u.company || '—'}</td>
                    <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{u.email}</td>
                    <td><code style={{ fontSize: '0.75rem', color: '#F59E0B' }}>{u.gstin || '—'}</code></td>
                    <td><code style={{ fontSize: '0.75rem' }}>{u.pan || '—'}</code></td>
                    <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{u.phone || '—'}</td>
                    <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{u.location || '—'}</td>
                    <td>
                      <span className={`badge ${u.registrationStatus === 'approved' && u.verified ? 'badge-green' : u.registrationStatus === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
                        {u.registrationStatus === 'approved' && u.verified ? <><FaShieldHalved /> Approved</> : u.registrationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {u.registrationStatus === 'pending' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleApprove(u.id, u.name)} className="btn btn-sm btn-success">
                            <FaCheck /> Approve
                          </button>
                          <button onClick={() => handleReject(u.id, u.name)} className="btn btn-sm btn-danger">
                            <FaXmark /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>—</span>
                      )}
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
