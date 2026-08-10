import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  FaLeaf, FaBars, FaXmark, FaChevronDown,
  FaGavel, FaBox, FaFileInvoiceDollar, FaCreditCard,
  FaBell, FaUser, FaRightFromBracket, FaGaugeHigh,
  FaClipboardList, FaTruck,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

const Logo = () => (
  <Link to="/" className="logo-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
    <img
      src="/logo2.png"
      alt="VegetableTonnes Logo"
      style={{
        height: 48,
        width: 48,
        objectFit: 'contain',
        borderRadius: '10px',
        filter: 'drop-shadow(0 0 8px rgba(20,184,166,0.35))',
      }}
    />
    <div>
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#0F172A' }}>
        Vegetable<span style={{ color: '#14B8A6' }}>Tonnes</span>
      </span>
      <div style={{ fontSize: '0.6rem', color: '#64748B', letterSpacing: '1.5px', fontWeight: 600, textTransform: 'uppercase', lineHeight: 1 }}>
        B2B Agricultural Exchange
      </div>
    </div>
  </Link>
);

const navLinkStyle = ({ isActive }) => ({
  textDecoration: 'none',
  color: isActive ? '#14B8A6' : '#475569',
  fontWeight: isActive ? 600 : 500,
  fontSize: '0.88rem',
  transition: 'color 0.18s',
  padding: '4px 0',
  borderBottom: isActive ? '2px solid #14B8A6' : '2px solid transparent',
  fontFamily: 'Inter, sans-serif',
});

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const publicLinks = [
    { to: '/products', label: 'Products' },
    { to: '/auctions', label: 'Auctions' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/about', label: 'About' },
  ];

  const accountMenuItems = (() => {
    if (user?.role === 'buyer') {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: <FaGaugeHigh /> },
        { to: '/my-bids', label: 'My Bids', icon: <FaGavel /> },
        { to: '/my-orders', label: 'Orders', icon: <FaClipboardList /> },
        { to: '/payments', label: 'Payments', icon: <FaCreditCard /> },
        { to: '/invoices', label: 'Invoices', icon: <FaFileInvoiceDollar /> },
        { to: '/notifications', label: 'Notifications', icon: <FaBell /> },
      ];
    }

    if (user?.role === 'farmer') {
      return [
        { to: '/farmer-dashboard', label: 'Dashboard', icon: <FaGaugeHigh /> },
        { to: '/notifications', label: 'Notifications', icon: <FaBell /> },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { to: '/admin', label: 'Admin Dashboard', icon: <FaGaugeHigh /> },
      ];
    }

    return [];
  })();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 800,
      background: scrolled
        ? 'rgba(255,255,255,0.92)'
        : 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: scrolled ? '1px solid rgba(20,184,166,0.15)' : '1px solid rgba(15,23,42,0.06)',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 66, gap: '2rem' }}>
        <Logo />

        {/* Desktop Nav Links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
          {publicLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} style={navLinkStyle}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Right Actions */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!user ? (
            <>
              <Link to="/auth" className="btn btn-glass btn-sm" id="nav-login-btn">Login</Link>
              <Link to="/auth?tab=register" className="btn btn-primary btn-sm" id="nav-register-btn">Register</Link>
            </>
          ) : (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                id="nav-user-menu-btn"
                onClick={() => setDropdownOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(20,184,166,0.10)',
                  border: '1px solid rgba(20,184,166,0.25)',
                  borderRadius: '10px', padding: '6px 12px',
                  cursor: 'pointer', color: '#0F172A',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.86rem', fontWeight: 600,
                  transition: 'all 0.18s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.78rem', color: '#fff',
                }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span>{user.name?.split(' ')[0]}</span>
                <FaChevronDown style={{ fontSize: '0.7rem', opacity: 0.6, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      minWidth: 220,
                      background: 'rgba(255,255,255,0.98)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(20,184,166,0.20)',
                      borderRadius: '14px',
                      padding: '0.5rem',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      zIndex: 1000,
                    }}
                  >
                    {/* User Info */}
                    <div style={{ padding: '0.75rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{user.email}</div>
                      <span className="badge badge-teal" style={{ marginTop: '4px' }}>{user.role}</span>
                    </div>

                    {/* Buyer Menu */}
                    {accountMenuItems.map(item => (
                      <Link key={item.to} to={item.to} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '0.6rem 0.85rem', borderRadius: '9px',
                        color: '#334155', textDecoration: 'none',
                        fontSize: '0.86rem', fontWeight: 500, transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.10)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ color: '#14B8A6', fontSize: '0.9rem' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    {/* Profile */}
                    <Link to="/profile" style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '0.6rem 0.85rem', borderRadius: '9px',
                      color: '#334155', textDecoration: 'none',
                      fontSize: '0.86rem', fontWeight: 500, transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.10)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <FaUser style={{ color: '#14B8A6', fontSize: '0.9rem' }} /> Profile
                    </Link>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.35rem 0' }} />

                    <button
                      id="nav-logout-btn"
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '0.6rem 0.85rem', borderRadius: '9px', border: 'none',
                        background: 'transparent', color: '#F87171', cursor: 'pointer',
                        fontSize: '0.86rem', fontWeight: 600, transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <FaRightFromBracket /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          id="nav-mobile-toggle"
          onClick={() => setMobileOpen(v => !v)}
          style={{
            display: 'none', marginLeft: 'auto',
            background: 'rgba(20,184,166,0.10)',
            border: '1px solid rgba(20,184,166,0.25)',
            borderRadius: '9px', padding: '7px 10px',
            color: '#14B8A6', cursor: 'pointer', fontSize: '1.1rem',
          }}
          className="show-mobile"
        >
          {mobileOpen ? <FaXmark /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.98)',
              borderTop: '1px solid rgba(20,184,166,0.12)',
            }}
          >
            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {publicLinks.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} style={({ isActive }) => ({
                  textDecoration: 'none',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '9px',
                  color: isActive ? '#14B8A6' : '#334155',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                  background: isActive ? 'rgba(20,184,166,0.08)' : 'transparent',
                })}>
                  {l.label}
                </NavLink>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />
              {user ? (
                <>
                  {accountMenuItems.map(item => (
                    <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '0.65rem 0.85rem', borderRadius: '9px',
                      color: isActive ? '#14B8A6' : '#334155',
                      fontWeight: isActive ? 600 : 400, fontSize: '0.9rem',
                      background: isActive ? 'rgba(20,184,166,0.08)' : 'transparent',
                    })}>
                      <span style={{ color: '#14B8A6' }}>{item.icon}</span>{item.label}
                    </NavLink>
                  ))}
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '0.65rem 0.85rem', borderRadius: '9px', border: 'none',
                    background: 'rgba(239,68,68,0.08)', color: '#F87171',
                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                    marginTop: '0.25rem',
                  }}>
                    <FaRightFromBracket /> Logout
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <Link to="/auth" className="btn btn-glass btn-sm btn-block">Login</Link>
                  <Link to="/auth?tab=register" className="btn btn-primary btn-sm btn-block">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu show fix */}
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
