import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaGear, FaBuilding, FaGavel, FaCreditCard, FaBell, FaShieldHalved } from 'react-icons/fa6';

const TABS = [
  { key: 'company', label: 'Company Info', icon: <FaBuilding /> },
  { key: 'auction', label: 'Auction Rules', icon: <FaGavel /> },
  { key: 'payment', label: 'Payment Config', icon: <FaCreditCard /> },
  { key: 'notifications', label: 'Notifications', icon: <FaBell /> },
];

const AdminSettings = () => {
  const [tab, setTab] = useState('company');
  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem('vt_admin_company');
    return saved ? JSON.parse(saved) : {
      name: 'VegetableTonnes Agri Exchange Pvt. Ltd.',
      gstin: '29AABCV1234M1Z5',
      email: 'support@vegetabletonnes.com',
      phone: '+91 98765 00000',
      address: 'Agri Tech Park, Pune, Maharashtra 411001',
      website: 'https://vegetabletonnes.com',
    };
  });
  const [auctionRules, setAuctionRules] = useState(() => {
    const saved = localStorage.getItem('vt_admin_auction');
    return saved ? JSON.parse(saved) : {
      minIncrement: 100,
      minOrderTons: 5,
      maxBidDuration: 7,
      autoCloseEnabled: true,
      requireVerification: true,
    };
  });

  const handleSaveCompany = () => {
    localStorage.setItem('vt_admin_company', JSON.stringify(company));
    toast.success('Company info saved!');
  };
  const handleSaveAuction = () => {
    localStorage.setItem('vt_admin_auction', JSON.stringify(auctionRules));
    toast.success('Auction rules saved!');
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Platform Settings</h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Configure platform-wide settings and rules</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {TABS.map(t => (
          <button key={t.key} id={`settings-tab-${t.key}`} onClick={() => setTab(t.key)}
            className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-glass'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'company' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem', fontSize: '1rem' }}>Company Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
            {[
              { key: 'name', label: 'Company Name' },
              { key: 'gstin', label: 'GSTIN' },
              { key: 'email', label: 'Support Email' },
              { key: 'phone', label: 'Contact Number' },
              { key: 'website', label: 'Website' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label>{f.label}</label>
                <input value={company[f.key]} onChange={e => setCompany(c => ({ ...c, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Registered Address</label>
              <textarea value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <button id="save-company-btn" onClick={handleSaveCompany} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Save Company Info</button>
        </div>
      )}

      {tab === 'auction' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem', fontSize: '1rem' }}>Auction Rules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
            <div className="form-group">
              <label>Minimum Bid Increment (₹)</label>
              <input type="number" value={auctionRules.minIncrement} onChange={e => setAuctionRules(r => ({ ...r, minIncrement: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Minimum Order (Tons)</label>
              <input type="number" value={auctionRules.minOrderTons} onChange={e => setAuctionRules(r => ({ ...r, minOrderTons: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Max Bid Duration (Days)</label>
              <input type="number" value={auctionRules.maxBidDuration} onChange={e => setAuctionRules(r => ({ ...r, maxBidDuration: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { key: 'autoCloseEnabled', label: 'Auto-close auctions when timer expires' },
              { key: 'requireVerification', label: 'Require buyer verification before bidding' },
            ].map(opt => (
              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={auctionRules[opt.key]} onChange={e => setAuctionRules(r => ({ ...r, [opt.key]: e.target.checked }))}
                  style={{ accentColor: '#14B8A6', width: 16, height: 16 }} />
                {opt.label}
              </label>
            ))}
          </div>
          <button id="save-auction-btn" onClick={handleSaveAuction} className="btn btn-primary">Save Auction Rules</button>
        </div>
      )}

      {tab === 'payment' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem', fontSize: '1rem' }}>Payment Configuration</h3>
          <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <p style={{ color: '#FCD34D', fontSize: '0.85rem' }}>⚠️ Payment gateway integration (Razorpay/Stripe) can be configured here. Currently running in simulation mode.</p>
          </div>
          {[
            { label: 'Payment Mode', value: 'Simulation (Mock)', note: 'Switch to Live for production' },
            { label: 'Gateway Provider', value: 'Razorpay (Not Connected)', note: 'Add API keys to activate' },
            { label: 'Supported Methods', value: 'UPI, Card, Net Banking, NEFT/RTGS' },
            { label: 'GST Rate (Agri Produce)', value: '5%' },
            { label: 'Invoice Auto-generation', value: 'After Payment Confirmation' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748B' }}>{item.label}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{item.value}</div>
                {item.note && <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: '1.5rem', fontSize: '1rem' }}>Notification Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Bid Submitted', desc: 'Notify admin when a new bid is placed', enabled: true },
              { label: 'Bid Accepted', desc: 'Notify buyer when their bid is accepted', enabled: true },
              { label: 'Bid Rejected', desc: 'Notify buyer when their bid is rejected', enabled: true },
              { label: 'Counter Offer', desc: 'Notify buyer about counter offer', enabled: true },
              { label: 'Payment Received', desc: 'Notify admin when payment is confirmed', enabled: true },
              { label: 'Invoice Generated', desc: 'Notify buyer when invoice is ready', enabled: true },
              { label: 'Dispatch Updates', desc: 'Notify buyer on dispatch status changes', enabled: false },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{item.desc}</div>
                </div>
                <span className={`badge ${item.enabled ? 'badge-green' : 'badge-neutral'}`}>
                  {item.enabled ? 'Active' : 'Off'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
