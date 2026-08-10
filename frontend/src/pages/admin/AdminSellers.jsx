import React from 'react';
import { FaTruck, FaLeaf, FaShieldHalved, FaBuilding } from 'react-icons/fa6';

const SELLERS = [
  { id: 'SEL001', name: 'Krishna Agro Farms', contact: 'Ramesh Krishna', phone: '+91 98765 43210', state: 'Maharashtra', commodities: 'Tomato, Onion', verified: true, supplyCapacity: '500 Ton/mo' },
  { id: 'SEL002', name: 'Punjab Green Fields', contact: 'Gurpreet Singh', phone: '+91 87654 32109', state: 'Punjab', commodities: 'Potato, Carrot', verified: true, supplyCapacity: '800 Ton/mo' },
  { id: 'SEL003', name: 'Hillside Organics', contact: 'Anand Sharma', phone: '+91 76543 21098', state: 'Himachal Pradesh', commodities: 'Broccoli, Capsicum, Green Peas', verified: false, supplyCapacity: '120 Ton/mo' },
  { id: 'SEL004', name: 'Wayanad Spice Hub', contact: 'Thomas Varghese', phone: '+91 65432 10987', state: 'Kerala', commodities: 'Ginger, Garlic', verified: true, supplyCapacity: '200 Ton/mo' },
  { id: 'SEL005', name: 'Deccan Fresh Co.', contact: 'Lakshmi Reddy', phone: '+91 54321 09876', state: 'Telangana', commodities: 'Ladyfinger, Spinach', verified: false, supplyCapacity: '250 Ton/mo' },
];

const AdminSellers = () => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Seller / Supplier Management</h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem' }}>{SELLERS.length} registered suppliers</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { l: 'Total Sellers', v: SELLERS.length, c: '#14B8A6' },
          { l: 'Verified', v: SELLERS.filter(s => s.verified).length, c: '#10B981' },
          { l: 'Pending', v: SELLERS.filter(s => !s.verified).length, c: '#F59E0B' },
          { l: 'States Covered', v: new Set(SELLERS.map(s => s.state)).size, c: '#8B5CF6' },
        ].map(s => (
          <div key={s.l} className="metric-card">
            <div className="metric-value" style={{ color: s.c }}>{s.v}</div>
            <div className="metric-label">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>Seller ID</th>
                <th>Farm / Company</th>
                <th>Contact</th>
                <th>State</th>
                <th>Commodities</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {SELLERS.map(s => (
                <tr key={s.id}>
                  <td><code style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>{s.id}</code></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaLeaf style={{ color: '#14B8A6', fontSize: '0.8rem' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{s.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#0f172a' }}>{s.contact}</td>
                  <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{s.state}</td>
                  <td style={{ fontSize: '0.8rem', color: '#0f766e', fontWeight: 600 }}>{s.commodities}</td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{s.supplyCapacity}</td>
                  <td>
                    <span className={`badge ${s.verified ? 'badge-green' : 'badge-amber'}`}>
                      {s.verified ? <><FaShieldHalved /> Verified</> : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button id={`seller-view-${s.id}`} className="btn btn-sm btn-glass">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSellers;
