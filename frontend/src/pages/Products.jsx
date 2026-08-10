import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaSeedling, FaGavel, FaWarehouse, FaLeaf, FaArrowRight,
  FaMagnifyingGlass, FaFilter, FaLocationDot, FaStar,
} from 'react-icons/fa6';

const gradeColors = {
  'S (Super)': '#F59E0B',
  'A': '#14B8A6',
  'B': '#3B82F6',
  'C': '#8B5CF6',
};

const auctionStatusBadge = {
  active: <span className="badge badge-teal">● Live Auction</span>,
  upcoming: <span className="badge badge-amber">Upcoming</span>,
  closed: <span className="badge badge-neutral">Closed</span>,
};

const ProductCard = ({ item }) => {
  const gradeColor = gradeColors[item.grade] || '#14B8A6';
  const availPct = Math.round((item.availableTons / item.totalQuantityTons) * 100);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22 }}
      className="glass-card"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Image / Icon Header */}
      <div style={{
        height: 160,
        background: `linear-gradient(135deg, ${gradeColor}18 0%, rgba(20,184,166,0.06) 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', gap: '0.5rem',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '18px',
          background: `${gradeColor}20`, border: `2px solid ${gradeColor}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem',
        }}>
          <FaLeaf style={{ color: gradeColor }} />
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          {auctionStatusBadge[item.auctionStatus] || null}
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{
            background: `${gradeColor}20`, border: `1px solid ${gradeColor}35`,
            color: gradeColor, padding: '2px 9px', borderRadius: 999,
            fontSize: '0.68rem', fontWeight: 700, fontFamily: 'Inter, sans-serif',
          }}>Grade {item.grade}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', marginBottom: '2px', color: '#0f172a' }}>{item.commodity}</h3>
          <div style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>{item.variety}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748B' }}>Available Stock</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.availableTons} <span style={{ color: '#64748B' }}>/ {item.totalQuantityTons} Tons</span></span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: 'rgba(15,23,42,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${availPct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${gradeColor}, ${gradeColor}99)` }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B' }}>
          <FaLocationDot style={{ color: '#14B8A6', fontSize: '0.72rem' }} />
          <span>{item.warehouse}</span>
        </div>

        <div className="divider" style={{ margin: '0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '2px' }}>Base Price</div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: gradeColor }}>
              ₹{item.basePricePerTon?.toLocaleString()}
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 400, color: '#64748B' }}>/Ton</span>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', textAlign: 'right' }}>
            <div>SKU</div>
            <div style={{ color: '#0f766e', fontWeight: 700, fontFamily: 'monospace' }}>{item.sku}</div>
          </div>
        </div>

        <Link
          to="/auctions"
          className="btn btn-primary btn-block"
          id={`product-bid-btn-${item.id}`}
          style={{ marginTop: 'auto' }}
        >
          <FaGavel /> Add to Bid
        </Link>
      </div>
    </motion.div>
  );
};

const Products = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const params = {};
        if (search) params.search = search;
        if (filterGrade) params.grade = filterGrade;
        if (filterStatus) params.auctionStatus = filterStatus;
        const res = await axios.get('/api/inventory', { params });
        setItems(res.data);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(fetchInventory, 300);
    return () => clearTimeout(delay);
  }, [search, filterGrade, filterStatus]);

  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePricePerTon - b.basePricePerTon;
    if (sortBy === 'price-desc') return b.basePricePerTon - a.basePricePerTon;
    if (sortBy === 'qty-desc') return b.availableTons - a.availableTons;
    return 0;
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <section style={{ padding: '3rem 0 1.5rem' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-tag"><FaSeedling /> Wholesale Inventory</span>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, marginBottom: '0.75rem' }}>
              Fresh <span className="gradient-text">Produce Catalog</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 560, lineHeight: 1.8 }}>
              Browse verified wholesale vegetable inventory. All commodities are graded and warehouse-ready. Place bids directly on live auctions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: '0 0 1.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
              <FaMagnifyingGlass style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: '#64748B', fontSize: '0.85rem',
              }} />
              <input
                id="products-search-input"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search commodity, variety, origin..."
                style={{
                  width: '100%', padding: '0.65rem 1rem 0.65rem 2.2rem',
                  background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(15,23,42,0.12)',
                  borderRadius: '10px', color: '#0f172a', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#14B8A6'}
                onBlur={e => e.target.style.borderColor = 'rgba(15,23,42,0.12)'}
              />
            </div>

            <select
              id="products-grade-filter"
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              style={{
                padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(15,23,42,0.12)', borderRadius: '10px',
                color: '#0f172a', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">All Grades</option>
              <option value="S (Super)">Grade S (Super)</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
            </select>

            <select
              id="products-auction-filter"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(15,23,42,0.12)', borderRadius: '10px',
                color: '#0f172a', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">All Auctions</option>
              <option value="active">Live Auctions</option>
              <option value="upcoming">Upcoming</option>
            </select>

            <select
              id="products-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(15,23,42,0.12)', borderRadius: '10px',
                color: '#0f172a', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="qty-desc">Most Available</option>
            </select>
          </div>

          {!loading && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#64748B' }}>
              Showing <strong style={{ color: '#14B8A6' }}>{sorted.length}</strong> commodities
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '0 0 4rem' }}>
        <div className="container">
          {loading ? (
            <div className="spinner" />
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
              <FaWarehouse style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }} />
              <p>No products match your filters. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid-3">
              {sorted.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <ProductCard item={item} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
