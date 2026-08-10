import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMagnifyingGlass, FaGavel, FaHourglass, FaCircleCheck,
  FaCreditCard, FaFileInvoiceDollar, FaTruck, FaArrowRight,
  FaShieldHalved, FaUsers, FaLeaf,
} from 'react-icons/fa6';

const steps = [
  {
    num: 1,
    icon: <FaMagnifyingGlass />,
    title: 'Discover Inventory',
    subtitle: 'Browse Products & Auctions',
    desc: 'Explore verified wholesale vegetable inventory. Filter by commodity, grade, origin, and warehouse. View live stock availability, base pricing, and auction timelines.',
    color: '#14B8A6',
    tags: ['Base Price / Ton', 'Grade & Variety', 'Available Qty', 'Warehouse Info'],
  },
  {
    num: 2,
    icon: <FaGavel />,
    title: 'Submit Wholesale Bid',
    subtitle: 'Place Your Offer',
    desc: 'Enter your offer price per tonne, required quantity, delivery destination (Mandi/warehouse), preferred delivery date, and any remarks. All bids are validated against available stock.',
    color: '#F59E0B',
    tags: ['Quantity (Tons)', 'Offer Price/Ton', 'Delivery Mandi', 'Delivery Date'],
  },
  {
    num: 3,
    icon: <FaHourglass />,
    title: 'Order Pending',
    subtitle: 'Awaiting Admin Review',
    desc: 'Your bid is instantly logged with a unique Order ID and timestamp. You\'ll receive an in-app notification when the review begins.',
    color: '#8B5CF6',
    tags: ['Order ID Generated', 'Bid Summary', 'Email Notification', 'In-App Alert'],
  },
  {
    num: 4,
    icon: <FaCircleCheck />,
    title: 'Admin Review',
    subtitle: 'Accept, Reject, or Counter',
    desc: 'Our procurement team reviews your bid for quality, price, and availability. They may Accept, Reject, Counter Offer with a revised price, or Request Clarification.',
    color: '#3B82F6',
    tags: ['Accept', 'Reject', 'Counter Offer', 'Request Clarification'],
  },
  {
    num: 5,
    icon: <FaCreditCard />,
    title: 'Payment',
    subtitle: 'Secure & Flexible',
    desc: 'Once accepted, proceed to payment using your preferred method. We support UPI, Credit/Debit Cards, Net Banking, NEFT/RTGS for large B2B transactions.',
    color: '#10B981',
    tags: ['UPI', 'Credit / Debit Card', 'Net Banking', 'NEFT / RTGS'],
  },
  {
    num: 6,
    icon: <FaFileInvoiceDollar />,
    title: 'Confirmation & Invoice',
    subtitle: 'GST Invoice + Dispatch',
    desc: 'On payment success, receive your GST invoice, order confirmation, and dispatch schedule. Track your shipment live until it reaches your destination.',
    color: '#EF4444',
    tags: ['GST Invoice', 'Order Confirmation', 'Dispatch Schedule', 'Live Tracking'],
  },
];

const reasons = [
  { icon: <FaShieldHalved />, title: 'Verified Buyers & Sellers', desc: 'Every entity on the platform undergoes KYC and GSTIN verification.' },
  { icon: <FaLeaf />, title: 'Farm-Fresh, Graded Produce', desc: 'All commodities are graded by our quality team before listing.' },
  { icon: <FaUsers />, title: 'Pan-India Network', desc: 'Suppliers from 20+ agri-states. Deliver to any Mandi or warehouse.' },
  { icon: <FaTruck />, title: 'End-to-End Logistics', desc: 'We manage dispatch, gate passes, and last-mile delivery coordination.' },
];

const HowItWorks = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ padding: '5rem 0 3rem', textAlign: 'center' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="section-tag"><FaGavel /> Bid Workflow</span>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, marginBottom: '1rem' }}>
              How <span className="gradient-text">VegetableTonnes</span> Works
            </h1>
            <p style={{ maxWidth: 600, margin: '0 auto 2rem', fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
              A transparent, end-to-end B2B agricultural bidding platform connecting wholesale buyers with verified produce suppliers across India.
            </p>
            <Link to="/auctions" className="btn btn-primary btn-lg" id="hiw-start-bidding-btn">
              Start Bidding <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Step-by-Step */}
      <section style={{ padding: '3rem 0 4rem' }}>
        <div className="container">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08 }}
              style={{
                display: 'grid',
                gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                gap: '3rem',
                alignItems: 'center',
                marginBottom: '4rem',
                direction: i % 2 === 0 ? 'ltr' : 'rtl',
              }}
              className="hiw-step-grid"
            >
              {/* Visual Side */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 260, height: 260,
                  borderRadius: '28px',
                  background: `radial-gradient(circle at 30% 30%, ${step.color}18, transparent 70%)`,
                  border: `1px solid ${step.color}28`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '1rem', position: 'relative', backdropFilter: 'blur(20px)',
                  boxShadow: `0 0 48px ${step.color}12`,
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '20px',
                    background: `linear-gradient(135deg, ${step.color}25, ${step.color}10)`,
                    border: `2px solid ${step.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', color: step.color,
                    boxShadow: `0 0 24px ${step.color}25`,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{
                    position: 'absolute', top: -14, left: -14,
                    width: 42, height: 42, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${step.color}, ${step.color}99)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '1rem', color: '#fff',
                    boxShadow: `0 0 16px ${step.color}50`,
                  }}>
                    {step.num}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', padding: '0 1rem' }}>
                    {step.tags.map(t => (
                      <span key={t} style={{
                        background: `${step.color}14`, border: `1px solid ${step.color}28`,
                        color: step.color, padding: '2px 9px', borderRadius: 999,
                        fontSize: '0.68rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div style={{ direction: 'ltr' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: step.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                  Step {step.num} — {step.subtitle}
                </div>
                <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
                  {step.title}
                </h2>
                <p style={{ color: '#475569', lineHeight: 1.85, fontSize: '0.97rem' }}>
                  {step.desc}
                </p>
                {i < steps.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1.5rem', color: step.color, fontSize: '0.85rem', fontWeight: 600 }}>
                    <FaArrowRight style={{ fontSize: '0.75rem' }} /> Next: {steps[i + 1].title}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why VegetableTonnes */}
      <section style={{ padding: '3rem 0 5rem', background: 'rgba(20,184,166,0.03)', borderTop: '1px solid rgba(20,184,166,0.10)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag"><FaShieldHalved /> Why Choose Us</span>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>Built for B2B Agricultural Trade</h2>
          </div>
          <div className="grid-4">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: '1.75rem', textAlign: 'center' }}
              >
                <div style={{
                  width: 54, height: 54, borderRadius: '16px',
                  background: 'rgba(20,184,166,0.10)',
                  border: '1px solid rgba(20,184,166,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.3rem', color: '#14B8A6',
                }}>
                  {r.icon}
                </div>
                <h4 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: '0.6rem' }}>{r.title}</h4>
                <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-teal"
            style={{ padding: '3.5rem 2rem', maxWidth: 700, margin: '0 auto' }}
          >
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, marginBottom: '1rem' }}>
              Ready to Place Your First <span className="gradient-text">Wholesale Bid?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>
              Join hundreds of verified buyers sourcing produce directly from farms across India.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth?tab=register" className="btn btn-primary btn-lg" id="hiw-register-btn">
                Register as Buyer
              </Link>
              <Link to="/products" className="btn btn-glass btn-lg" id="hiw-browse-btn">
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hiw-step-grid {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HowItWorks;
