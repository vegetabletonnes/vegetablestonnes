import React from 'react';
import { motion } from 'framer-motion';
import { FaNewspaper } from 'react-icons/fa6';

const News = () => {
  return (
    <div className="page-section" style={{ minHeight: '80vh', padding: '5rem 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FaNewspaper style={{ fontSize: '3rem', color: '#f97316', marginBottom: '1rem' }} />
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: '1rem' }}>News & Articles</h1>
          <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Stay updated with the latest happenings at VegetableTonnes, market trends, and agricultural insights.
          </p>
          
          <div style={{ padding: '3rem', background: 'rgba(249,115,22,0.05)', borderRadius: '16px', border: '1px dashed rgba(249,115,22,0.3)', color: '#475569' }}>
            <em>No articles published yet. Stay tuned for exciting updates!</em>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default News;
