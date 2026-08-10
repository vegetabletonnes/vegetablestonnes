import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  FaStore, FaBolt, FaCircleCheck, FaTruck, FaChartLine,
  FaSeedling, FaFire, FaShieldHalved, FaHandshake, FaArrowRight, FaUserPlus
} from 'react-icons/fa6';

const StatCounter = ({ end, label, color, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = end / 60;
    const timer = setInterval(() => {
      start += inc;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [end]);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.8rem)', color }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500, marginTop: '4px' }}>{label}</div>
    </div>
  );
};

const Home = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    axios.get('/api/auctions?status=active')
      .then(r => setAuctions(r.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const features = [
    { icon: <FaHandshake />, title: 'Direct Farm Onboarding', desc: 'Farmers connect with company leadership directly. Our company head verifies quality and manages listing for maximum price discovery.' },
    { icon: <FaBolt />, title: 'Live Auctions', desc: 'Real-time bidding with countdown timers. Place bids, track rankings, and win bulk deals transparently.' },
    { icon: <FaShieldHalved />, title: 'GST Verified Buyers', desc: 'All buyers verified with GSTIN & PAN. Secure, fully compliant enterprise transactions every time.' },
    { icon: <FaTruck />, title: 'Digital Gate Pass', desc: 'Assign truck and driver details upon winning. Receive automated digital gate passes for yard dock loading.' },
    { icon: <FaChartLine />, title: 'Market Transparency', desc: 'Real-time auction leaderboards driven purely by open market demand and supply.' },
    { icon: <FaSeedling />, title: 'Audited Quality', desc: 'All produce physically inspected and grade-certified before listing. Guaranteed bulk quality.' },
  ];

  return (
    <div className="page-section">

      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 0 4rem' }}>
        {/* Green orb BG */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.12) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto', padding: '0 1rem' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '999px', padding: '6px 16px', marginBottom: '1.5rem',
              fontSize: '0.82rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.5px',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-live 1.5s infinite' }} />
              Live Bulk Vegetable Auctions Running Now
            </div>

            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              <span className="gradient-text">Bulk Produce Auctions</span>{' '}
              <span style={{ color: '#0f172a' }}>Curated for</span>{' '}
              <span className="gradient-text-orange">Institutional Buyers</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#475569', maxWidth: '680px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
              Farmers partner directly with VegetableTonnes company leadership. We quality-audit the crop, list tonnage, and open live competitive auctions for verified bulk buyers.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auctions" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FaFire style={{ color: '#f97316' }} /> Explore Live Auctions
              </Link>
              <Link to="/auth?tab=register" className="btn btn-glass btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FaUserPlus /> Register as Buyer <FaArrowRight style={{ fontSize: '0.8rem' }} />
              </Link>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              marginTop: '4rem',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '2rem',
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <StatCounter end={500} suffix="+" label="Metric Tons Auctioned Daily" color="#22c55e" />
            <StatCounter end={1400} suffix="+" label="Verified Enterprise Buyers" color="#f97316" />
            <StatCounter end={50} suffix="+" label="Direct Farm Hubs" color="#fbbf24" />
            <StatCounter end={100} suffix="%" label="GST Tax Compliant" color="#60a5fa" />
          </motion.div>
        </div>
      </section>

      {/* Live Auctions Preview */}
      {auctions.length > 0 && (
        <section style={{ padding: '3rem 0' }}>
          <div className="container">
            <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-live">LIVE</span>
                  Active Produce Auctions
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>Bid now on company-verified bulk farm produce</p>
              </div>
              <Link to="/auctions" className="btn btn-outline-green btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                View All Auctions <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </div>

            <div className="grid-3">
              {auctions.map((auc, i) => (
                <motion.div
                  key={auc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card"
                  style={{ overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => window.location.href = `/auctions/${auc.id}`}
                >
                  <img src={auc.productImage} alt={auc.productName} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-live">Live</span>
                      <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Stock: {auc.availableStock} Tons</span>
                    </div>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', marginBottom: '6px' }}>{auc.productName}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' }}>{auc.origin} · {auc.grade}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Highest Bid</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#22c55e', fontFamily: 'Outfit, sans-serif' }}>
                          ₹{auc.currentHighestBid?.toLocaleString()}/Ton
                        </div>
                      </div>
                      <Link to={`/auctions/${auc.id}`} className="btn btn-orange btn-sm">Bid Now</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>How VegetableTonnes Works</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Managed quality, direct bidding</p>

          <div className="grid-4">
            {[
              { step: '01', icon: <FaHandshake />, title: 'Farmer Approaches Company', desc: 'Farmer contacts VegetableTonnes head with harvest details & volume' },
              { step: '02', icon: <FaSeedling />, title: 'Quality Audit & Listing', desc: 'Company head verifies produce quality, sets specifications, and creates live auction' },
              { step: '03', icon: <FaBolt />, title: 'Buyers Place Live Bids', desc: 'GST-verified bulk buyers compete transparently in live auctions' },
              { step: '04', icon: <FaTruck />, title: 'Vehicle Dispatch & Pickup', desc: 'Winning buyer assigns truck details and receives a digital gate pass' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: '1.5rem', textAlign: 'center' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', margin: '0 auto 1rem',
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
                  border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', color: '#22c55e'
                }}>{s.icon}</div>
                <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>STEP {s.step}</div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', marginBottom: '8px' }}>{s.title}</h4>
                <p style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontFamily: 'Outfit, sans-serif', marginBottom: '2rem' }}>
            Why Choose <span className="gradient-text">VegetableTonnes</span>?
          </h2>
          <div className="grid-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card"
                style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
              >
                <div style={{ fontSize: '1.5rem', color: '#22c55e', flexShrink: 0, marginTop: '2px' }}>{f.icon}</div>
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', marginBottom: '6px', color: '#0f172a' }}>{f.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(249,115,22,0.1) 100%)',
              border: '1px solid rgba(34,197,94,0.25)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1rem' }}>
              Ready to Procurement <span className="gradient-text">Directly</span>?
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Join 1,400+ verified enterprise buyers on India's most transparent bulk agri procurement platform.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth?tab=register" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FaUserPlus /> Register as Buyer
              </Link>
              <Link to="/auctions" className="btn btn-glass btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Explore Auctions <FaArrowRight style={{ fontSize: '0.8rem' }} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
