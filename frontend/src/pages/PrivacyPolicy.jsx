import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldHalved } from 'react-icons/fa6';

const PrivacyPolicy = () => {
  return (
    <div className="page-section">
      <div className="container" style={{ maxWidth: '800px', padding: '3rem 0' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <FaShieldHalved style={{ fontSize: '2rem', color: '#22c55e' }} />
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', margin: 0 }}>Privacy Policy</h1>
          </div>
          <div className="glass-card" style={{ padding: '2.5rem', color: '#475569', lineHeight: 1.8 }}>
            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>1. Introduction</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Welcome to VegetableTonnes. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
            </p>

            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>2. Information We Collect</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our products and services, when you participate in activities on the platform, or otherwise when you contact us. This includes your name, email address, phone number, GSTIN, PAN, and address details.
            </p>

            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>3. How We Use Your Information</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              We use the information we collect or receive to facilitate account creation, authentication, manage user accounts, and process transactions.
            </p>

            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>4. Information Sharing</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on specific legal basis.
            </p>

            <h3 style={{ color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>5. Security</h3>
            <p style={{ marginBottom: '0' }}>
              We aim to protect your personal information through a system of organizational and technical security measures. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
