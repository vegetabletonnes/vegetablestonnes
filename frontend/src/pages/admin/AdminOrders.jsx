import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBox, FaTruck, FaPhone } from 'react-icons/fa6';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/orders');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBox style={{ color: '#22c55e' }} /> Orders & Dispatch Logistics
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Monitor order fulfillments, vehicle assignments, and digital gate passes</p>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="spinner" />
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          No orders created yet.
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(15,23,42,0.10)', color: '#047857', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Commodity</th>
                <th style={{ padding: '1rem' }}>Buyer Company</th>
                <th style={{ padding: '1rem' }}>Farm Source</th>
                <th style={{ padding: '1rem' }}>Quantity & Value</th>
                <th style={{ padding: '1rem' }}>Logistics / Vehicle</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>{o.id}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>
                    {o.commodity || 'Vegetables'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{o.buyerCompany || 'Bulk Buyer'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {o.buyerId}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#475569', fontWeight: 500 }}>{o.farmerName || 'Direct Farm Source'}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#d97706' }}>{o.quantity} Tons</div>
                    <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 600 }}>₹{o.totalValue?.toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {o.vehicleNo ? (
                      <div>
                        <div style={{ fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaTruck /> {o.vehicleNo}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaPhone /> {o.driverPhone || 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <span className="badge badge-gold">Pending Vehicle</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${o.status === 'delivered' ? 'badge-live' : o.status === 'dispatched' ? 'badge-gold' : 'badge-neutral'}`}>
                      {o.status ? o.status.toUpperCase() : 'APPROVED'}
                    </span>
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

export default AdminOrders;
