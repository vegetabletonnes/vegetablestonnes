import React from 'react';
import { motion } from 'framer-motion';
import { FaImage } from 'react-icons/fa6';

const Gallery = () => {
  return (
    <div className="page-section" style={{ minHeight: '80vh', padding: '5rem 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FaImage style={{ fontSize: '3rem', color: '#14B8A6', marginBottom: '1rem' }} />
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: '1rem' }}>Farm Gallery</h1>
          <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto 3rem' }}>
            A glimpse into our farmlands where fresh, high-quality produce is grown and harvested before being sold at our auctions.
          </p>
          
          <div style={{ padding: '3rem', background: 'rgba(20,184,166,0.05)', borderRadius: '16px', border: '1px dashed rgba(20,184,166,0.3)', color: '#475569' }}>
            <em>Gallery photos coming soon. Check back later to see our latest harvests!</em>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Gallery;
