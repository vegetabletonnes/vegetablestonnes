import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

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
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '1.5rem' }}>
            My Profile
          </h1>
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
    </div>
  );
};

export default Profile;
