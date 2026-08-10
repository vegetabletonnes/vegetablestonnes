import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUsers, FaLocationDot, FaPhone, FaCheck } from 'react-icons/fa6';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/verify`);
      toast.success('User verified successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to verify user');
    }
  };

  const filteredUsers = users.filter(u => !roleFilter || u.role === roleFilter);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUsers style={{ color: '#22c55e' }} /> Bulk Buyers & KYB Management
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Verify registered institutional purchasing agents, wholesale companies, and corporate accounts</p>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>Filter Role:</span>
        {['', 'buyer', 'admin'].map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className="btn btn-sm"
            style={{
              background: roleFilter === r ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)',
              border: roleFilter === r ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: roleFilter === r ? '#22c55e' : '#9ca3af',
              textTransform: 'capitalize',
            }}
          >
            {r === '' ? `All Accounts (${users.length})` : `${r}s`}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="spinner" />
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          No registered accounts found.
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(15,23,42,0.10)', color: '#047857', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '1rem' }}>User / Company</th>
                <th style={{ padding: '1rem' }}>Email & Phone</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Location / GST</th>
                <th style={{ padding: '1rem' }}>Verification</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{u.company || 'Enterprise Account'}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#475569', fontWeight: 500 }}>{u.email}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaPhone /> {u.phone || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-gold' : u.role === 'buyer' ? 'badge-live' : 'badge-neutral'}`}>
                      {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaLocationDot style={{ color: '#22c55e' }} /> {u.city || u.location || 'India'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{u.gstin ? `GST: ${u.gstin}` : ''}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.verified ? (
                      <span className="badge badge-live">VERIFIED</span>
                    ) : (
                      <span className="badge badge-gold">UNVERIFIED</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {!u.verified && u.role !== 'admin' && (
                      <button
                        onClick={() => handleVerify(u.id)}
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FaCheck /> Verify Account
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
