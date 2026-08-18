import React from 'react';
import { motion } from 'framer-motion';
import { FaScaleBalanced } from 'react-icons/fa6';

const TermsOfService = () => {
  return (
    <div className="page-section">
      <div className="container" style={{ maxWidth: '800px', padding: '3rem 0' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <FaScaleBalanced style={{ fontSize: '2rem', color: '#f97316' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', margin: 0 }}>Terms of Service</h1>
          </div>
          <div className="glass-card" style={{ padding: '2.5rem', color: '#475569', lineHeight: 1.8 }}>
            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>1. Agreement to Terms</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              By accessing or using the VegetableTonnes platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
            </p>

            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>2. Use License</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Permission is granted to temporarily access the materials on VegetableTonnes's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials, use the materials for any commercial purpose, or attempt to decompile or reverse engineer any software contained on the platform.
            </p>

            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>3. User Accounts</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our platform. You are responsible for safeguarding the password that you use to access the platform.
            </p>

            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>4. Bidding and Transactions</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              All bids placed on the platform are considered legally binding offers to purchase. VegetableTonnes acts as a facilitator for transactions between buyers and farmers/sellers. We reserve the right to cancel or suspend any auction or bid in cases of suspected fraud or platform abuse.
            </p>

            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>5. Limitation of Liability</h3>
            <p style={{ marginBottom: '0' }}>
              In no event shall VegetableTonnes or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
