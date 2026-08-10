import React from 'react';
import { motion } from 'framer-motion';
import { FaScaleBalanced, FaChartLine, FaTruck, FaShieldHalved, FaBolt, FaHandshake } from 'react-icons/fa6';

const About = () => (
  <div className="page-section">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1rem' }}>
              About <span className="gradient-text">VegetableTonnes</span>
            </h1>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
              India's most transparent B2B agricultural bidding infrastructure — engineered to eliminate multiple layers of intermediaries in bulk vegetable supply chains.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid #22c55e' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1rem', color: '#047857' }}>Our Mission</h2>
            <p style={{ color: '#334155', lineHeight: 1.8 }}>
              <strong style={{ color: '#0f172a' }}>VegetableTonnes</strong> connects institutional buyers — including food processing plants, hypermarket chains, hotels, and major wholesale distributors — with direct regional farm produce curated by our company leadership. Farmers approach our company head directly with harvest specs, and we host transparent live auctions for enterprise bulk buyers.
            </p>
          </div>

          <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', color: '#047857' }}>Operational Pillars</h3>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            {[
              { num: '01', icon: <FaScaleBalanced />, title: 'Grade Standardization', desc: 'Every metric ton of produce listed undergoes physical sorting and quality auditing by company experts before listing.' },
              { num: '02', icon: <FaChartLine />, title: 'Transparent Discovery', desc: 'Real-time bulk bidding ensures fair market price discovery driven strictly by supply volume and buyer demand. All bids visible.' },
              { num: '03', icon: <FaTruck />, title: 'Yard Fulfillment', desc: 'Buyer-side vehicle assignment enables streamlined weighbridge entry and rapid dock loading with digital gate passes.' },
              { num: '04', icon: <FaShieldHalved />, title: 'GST & Legal Compliance', desc: 'All buyers must hold valid GSTIN and PAN. Frictionless commercial invoicing and weighbridge verification.' },
              { num: '05', icon: <FaBolt />, title: 'Real-time Auctions', desc: 'Countdown timers, live leaderboards, and instant bid placement. No delayed discovery, no information asymmetry.' },
              { num: '06', icon: <FaHandshake />, title: 'Managed Farm Partnerships', desc: 'Farmers approach company head directly to list crop volumes without needing complex software tools.' },
            ].map(p => (
              <motion.div
                key={p.num}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                className="glass-card"
                style={{ padding: '1.5rem' }}
              >
                <div style={{ fontSize: '1.5rem', color: '#22c55e', marginBottom: '0.75rem' }}>{p.icon}</div>
                <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>PILLAR {p.num}</div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem', color: '#0f172a' }}>{p.title}</h4>
                <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(249,115,22,0.06))' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.5rem', color: '#0f172a' }}>Platform by the Numbers</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
              {[
                { val: '500+', label: 'Tons Auctioned Daily', color: '#059669' },
                { val: '1,400+', label: 'Verified Enterprise Buyers', color: '#ea580c' },
                { val: '50+', label: 'Direct Farm Hubs', color: '#d97706' },
                { val: '18', label: 'States Covered', color: '#2563eb' },
                { val: '100%', label: 'GST Compliant', color: '#059669' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

export default About;
