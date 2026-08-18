import React from 'react';
import { Link } from 'react-router-dom';
import { FaSeedling, FaCheck, FaEnvelope, FaPhone, FaLocationDot } from 'react-icons/fa6';

const Footer = () => (
  <footer style={{
    background: 'linear-gradient(135deg, #044e3a 0%, #065f46 50%, #047857 100%)',
    color: '#ffffff',
    borderTop: '1px solid rgba(110, 231, 183, 0.2)',
    padding: '3rem 0 1.5rem',
    marginTop: 'auto',
    boxShadow: '0 -10px 30px rgba(4, 78, 58, 0.25)',
  }}>
    <div className="container">
      <div className="grid-4" style={{ marginBottom: '2rem', gap: '2rem' }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <span style={{ color: '#6ee7b7', fontSize: '1.4rem', display: 'flex' }}><FaSeedling /></span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
              <span style={{ color: '#ffffff' }}>VEGETABLE</span>
              <span style={{ color: '#6ee7b7' }}>TONNES</span>
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.7 }}>
            India's premier B2B agri bidding platform. Verified farm produce curated directly by company management for enterprise bulk buyers.
          </p>
        </div>

        {/* Platform */}
        <div>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#a7f3d0', marginBottom: '1rem', fontWeight: 700 }}>Platform</h4>
          {[
            { to: '/auctions', label: 'Live Auctions' },
            { to: '/auth?tab=register', label: 'Register Buyer' },
            { to: '/about', label: 'About Platform' },
            { to: '/admin/login', label: 'Company Admin Portal' },
          ].map(l => (
            <Link key={l.to} to={l.to} style={{
              display: 'block', color: '#d1fae5', textDecoration: 'none',
              fontSize: '0.87rem', marginBottom: '0.5rem', transition: 'color 0.2s',
            }}
              onMouseOver={e => e.target.style.color = '#ffffff'}
              onMouseOut={e => e.target.style.color = '#d1fae5'}
            >{l.label}</Link>
          ))}
        </div>

        {/* Contact Us */}
        <div>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#a7f3d0', marginBottom: '1rem', fontWeight: 700 }}>Contact Us</h4>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6ee7b7' }}><FaEnvelope /></span>
              <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>contact@vegetabletonnes.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6ee7b7' }}><FaPhone /></span>
              <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>99725 09325</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#6ee7b7', marginTop: '2px' }}><FaLocationDot /></span>
              <a href="https://maps.app.goo.gl/eUNXisHh2GkXy9ey7" target="_blank" rel="noopener noreferrer" style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: '1.4', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = '#ffffff'}
                onMouseOut={e => e.target.style.color = '#e2e8f0'}
              >
                27-136-7-2 First Floor, GokulCircle,<br/>
                Chowdepalle Road, Punganur,<br/>
                Chittoor Dist., Andhra Pradesh - 517247, India
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#a7f3d0', marginBottom: '1rem', fontWeight: 700 }}>Platform Stats</h4>
          {[
            { label: 'Tons Auctioned Daily', value: '500+' },
            { label: 'Verified Bulk Buyers', value: '1,400+' },
            { label: 'Direct Farm Hubs', value: '50+' },
            { label: 'States Covered', value: '18' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: '0.6rem' }}>
              <span style={{ color: '#6ee7b7', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{s.value} </span>
              <span style={{ color: '#d1fae5', fontSize: '0.82rem' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.15)',
        paddingTop: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
          © 2026 VegetableTonnes B2B Logistics Platform. All Rights Reserved. Developed by{' '}
          <a
            href="https://viztechsolutions.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#6ee7b7', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = '#ffffff'}
            onMouseOut={e => e.target.style.color = '#6ee7b7'}
          >Viztechsolutions</a>.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {[
            { label: 'Privacy Policy', path: '/privacy-policy' },
            { label: 'Terms of Service', path: '/terms-of-service' },
            { label: 'Contact', path: '/about' }
          ].map(t => (
            <Link key={t.label} to={t.path} style={{ fontSize: '0.82rem', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color = '#ffffff'}
              onMouseOut={e => e.target.style.color = '#cbd5e1'}
            >{t.label}</Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
