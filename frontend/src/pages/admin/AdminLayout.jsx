import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FaChartPie, FaBoxOpen, FaGavel, FaCoins, FaTruck, FaUsers,
  FaSeedling, FaRightFromBracket, FaAngleLeft, FaAngleRight, FaBars, FaBolt,
  FaWarehouse, FaStore, FaLeaf, FaChartBar, FaGear
} from 'react-icons/fa6';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: <FaChartPie />, end: true },
  { to: '/admin/inventory', label: 'Inventory', icon: <FaWarehouse /> },
  { to: '/admin/products', label: 'Products', icon: <FaBoxOpen /> },
  { to: '/admin/auctions', label: 'Auctions', icon: <FaGavel /> },
  { to: '/admin/bids', label: 'Bids', icon: <FaCoins /> },
  { to: '/admin/orders', label: 'Orders', icon: <FaTruck /> },
  { to: '/admin/buyers', label: 'Buyers', icon: <FaStore /> },
  { to: '/admin/sellers', label: 'Sellers', icon: <FaLeaf /> },
  { to: '/admin/users', label: 'Users', icon: <FaUsers /> },
  { to: '/admin/reports', label: 'Reports', icon: <FaChartBar /> },
  { to: '/admin/settings', label: 'Settings', icon: <FaGear /> },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fbfb' }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '64px' : '240px',
        transition: 'width 0.3s ease',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(34,197,94,0.12)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <span style={{ color: '#22c55e', fontSize: '1.3rem', display: 'flex' }}><FaSeedling /></span>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                VT <span style={{ color: '#22c55e' }}>Admin</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Company Portal</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.9rem', display: collapsed ? 'none' : 'block' }}
          ><FaAngleLeft /></button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {sidebarLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: collapsed ? '12px' : '10px 14px',
              borderRadius: '10px', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: isActive ? 'rgba(34,197,94,0.15)' : 'transparent',
              color: isActive ? '#22c55e' : '#475569',
              border: isActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
            })}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, display: 'flex' }}>{l.icon}</span>
              {!collapsed && l.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed && (
            <div style={{ padding: '8px 14px', marginBottom: '6px', background: 'rgba(34,197,94,0.08)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>Company Head / Admin</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s',
          }}>
            <FaRightFromBracket /> {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: collapsed ? '64px' : '240px', transition: 'margin-left 0.3s ease', minHeight: '100vh' }}>
        {/* Top Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(15,23,42,0.08)',
          padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1rem', display: 'flex' }}>
            {collapsed ? <FaAngleRight /> : <FaBars />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-live" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FaBolt /> Live Platform
            </span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
