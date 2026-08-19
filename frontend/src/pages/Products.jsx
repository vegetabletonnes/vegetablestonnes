import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaSeedling, FaGavel, FaWarehouse, FaLeaf, FaArrowRight,
  FaMagnifyingGlass, FaFilter, FaLocationDot, FaStar,
} from 'react-icons/fa6';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';

const gradeColors = {
  'S (Super)': '#F59E0B',
  'A+': '#F59E0B',
  'A': '#14B8A6',
  'B': '#3B82F6',
  'C': '#8B5CF6',
};

const auctionStatusBadge = {
  active: (
    <span className="badge" style={{ 
      background: '#dc2626', color: '#fff', border: '1px solid #fca5a5', 
      padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800, 
      textShadow: '0 1px 2px rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'pulse-live 2s infinite'
    }}>
      ● LIVE AUCTION
    </span>
  ),
  upcoming: (
    <span className="badge" style={{ 
      background: '#f59e0b', color: '#fff', border: '1px solid #fcd34d', 
      padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800, 
      textShadow: '0 1px 2px rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      UPCOMING
    </span>
  ),
  closed: null,
};

const ProductCard = ({ item }) => {
  const gradeColor = gradeColors[item.grade] || '#14B8A6';
  const imgUrl = item.imageUrl || item.image; // Fallback to inventory image if we added one later

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
        background: imgUrl ? `url(${imgUrl}) center/cover no-repeat` : `linear-gradient(135deg, ${gradeColor}18 0%, rgba(20,184,166,0.06) 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', gap: '0.5rem',
      }}>
        {imgUrl && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%, transparent 100%)' }} />
        )}
        
        {!imgUrl && (
          <div style={{
            width: 64, height: 64, borderRadius: '18px',
            background: `${gradeColor}20`, border: `2px solid ${gradeColor}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
          }}>
            <FaLeaf style={{ color: gradeColor }} />
          </div>
        )}
        
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
          {auctionStatusBadge[item.auctionStatus] || null}
        </div>
        
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
          <span style={{
            background: imgUrl ? 'rgba(0,0,0,0.7)' : `${gradeColor}20`, 
            border: `1px solid ${imgUrl ? 'rgba(255,255,255,0.3)' : `${gradeColor}35`}`,
            color: imgUrl ? '#fff' : gradeColor, 
            padding: '3px 10px', borderRadius: 999,
            fontSize: '0.7rem', fontWeight: 700, fontFamily: 'Inter, sans-serif',
            backdropFilter: imgUrl ? 'blur(4px)' : 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>Grade {item.grade || 'A'}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', marginBottom: '2px', color: '#0f172a' }}>{item.commodity}</h3>
          <div style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 600, marginBottom: '6px' }}>{item.variety}</div>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B', marginTop: 'auto' }}>
          <FaLocationDot style={{ color: '#14B8A6', fontSize: '0.72rem' }} />
          <span>{item.warehouse}</span>
        </div>
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
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (filterGrade) params.grade = filterGrade;
        if (filterStatus) params.auctionStatus = filterStatus;
        
        const res = await axios.get('/api/inventory', { params });
        let apiItems = res.data || [];
        
        // Merge the image URLs from DEFAULT_PRODUCTS into the DB response
        // Match by exact ID first, then fuzzy match by commodity name so even manually added defaults get their image!
        const getFallbackImage = (commodityName) => {
          if (!commodityName) return null;
          const lower = commodityName.toLowerCase();
          if (lower.includes('tomato')) return '/tomatoes.jpg';
          if (lower.includes('watermelon')) return '/Watermelons.jpeg';
          if (lower.includes('muskmelon')) return '/Muskmelons.jpg';
          if (lower.includes('mango')) return '/Mangoes.jpg';
          if (lower.includes('groundnut')) return '/Groundnuts.jpg';
          return null;
        };

        const mergedItems = apiItems.map(apiItem => {
          const defaultProd = DEFAULT_PRODUCTS.find(dp => dp.id === apiItem.id);
          const fallbackImage = getFallbackImage(apiItem.commodity);
          return { ...apiItem, imageUrl: defaultProd?.imageUrl || fallbackImage || apiItem.imageUrl || apiItem.image };
        });

        setItems(mergedItems);
      } catch (err) {
        toast.error('Failed to load products');
        // Fallback entirely to defaults if API fails
        setItems(DEFAULT_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    
    const delay = setTimeout(fetchInventory, 300);
    return () => clearTimeout(delay);
  }, [search, filterGrade, filterStatus]);

  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.basePricePerTon || 0) - (b.basePricePerTon || 0);
    if (sortBy === 'price-desc') return (b.basePricePerTon || 0) - (a.basePricePerTon || 0);
    if (sortBy === 'qty-desc') return (b.availableTons || 0) - (a.availableTons || 0);
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
            <p style={{ color: '#475569', maxWidth: 560, lineHeight: 1.8, marginTop: '0.5rem' }}>
              Browse verified wholesale vegetable and fruit inventory. All commodities are graded and warehouse-ready. Place bids directly on live auctions.
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
              <option value="A+">Grade A+</option>
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
              <option value="">All Products</option>
              <option value="active">Live Auctions</option>
              <option value="upcoming">Upcoming Auctions</option>
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
              Showing <strong style={{ color: '#14B8A6' }}>{sorted.length}</strong> farm products
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
                  <Link to="/auctions" style={{ textDecoration: 'none' }}>
                    <ProductCard item={item} />
                  </Link>
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
