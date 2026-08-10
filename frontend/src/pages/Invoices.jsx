import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { FaFileInvoiceDollar, FaDownload, FaPrint, FaArrowLeft } from 'react-icons/fa6';

const InvoiceCard = ({ invoice }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="glass-card"
    style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
  >
    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
      <div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#14B8A6', fontSize: '1rem' }}>
          {invoice.invoiceNumber}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
          Order: {invoice.orderId} · {new Date(invoice.generatedAt).toLocaleDateString('en-IN')}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.15rem' }}>
          ₹{invoice.total?.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>incl. {invoice.gstRate}% GST</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
      {[
        { l: 'Commodity', v: invoice.commodity },
        { l: 'Quantity', v: `${invoice.quantity} Tons` },
        { l: 'Price/Ton', v: `₹${invoice.pricePerTon?.toLocaleString()}` },
        { l: 'Subtotal', v: `₹${invoice.subtotal?.toLocaleString()}` },
        { l: 'GST (5%)', v: `₹${invoice.gstAmount?.toLocaleString()}` },
        { l: 'Total', v: `₹${invoice.total?.toLocaleString()}`, highlight: true },
      ].map(item => (
        <div key={item.l} style={{ padding: '0.6rem', background: 'rgba(20,184,166,0.06)', borderRadius: '8px', border: '1px solid rgba(20,184,166,0.12)' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748B', marginBottom: '2px', fontWeight: 600, textTransform: 'uppercase' }}>{item.l}</div>
          <div style={{ fontSize: '0.88rem', fontWeight: item.highlight ? 700 : 600, color: item.highlight ? '#14B8A6' : '#0f172a' }}>{item.v}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
      <Link to={`/invoices/${invoice.id}`} className="btn btn-primary btn-sm" id={`invoice-view-btn-${invoice.id}`}>
        <FaFileInvoiceDollar /> View Invoice
      </Link>
      <button className="btn btn-glass btn-sm" id={`invoice-print-btn-${invoice.id}`} onClick={() => window.print()}>
        <FaPrint /> Print
      </button>
    </div>
  </motion.div>
);

export const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('vt_token');
        const res = await axios.get('/api/invoices/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(res.data);
      } catch {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="page-section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="section-tag"><FaFileInvoiceDollar /> Tax Documents</span>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>My Invoices</h1>
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Total Invoices', value: invoices.length, color: '#14B8A6' },
              { label: 'Total Value', value: `₹${(invoices.reduce((s, i) => s + (i.total || 0), 0) / 100000).toFixed(1)}L`, color: '#10B981' },
              { label: 'GST Paid', value: `₹${invoices.reduce((s, i) => s + (i.gstAmount || 0), 0).toLocaleString()}`, color: '#F59E0B' },
              { label: 'This Month', value: invoices.filter(i => new Date(i.generatedAt).getMonth() === new Date().getMonth()).length, color: '#8B5CF6' },
            ].map(s => (
              <div key={s.label} className="metric-card">
                <div className="metric-value" style={{ color: s.color }}>{s.value}</div>
                <div className="metric-label">{s.label}</div>
              </div>
            ))}
          </div>

          {loading ? <div className="spinner" /> : invoices.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              <FaFileInvoiceDollar style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
              <p>No invoices yet. Invoices are generated after order payment confirmation.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {invoices.map((inv, i) => (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <InvoiceCard invoice={inv} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export const InvoiceViewer = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('vt_token');
        const res = await axios.get(`/api/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoice(res.data);
      } catch {
        toast.error('Invoice not found');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!invoice) return <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Invoice not found.</div>;

  return (
    <div className="page-section">
      <div className="container" style={{ maxWidth: 760 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Actions */}
          <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <Link to="/invoices" className="btn btn-glass btn-sm" id="invoice-back-btn">
              <FaArrowLeft /> Back to Invoices
            </Link>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-glass btn-sm" id="invoice-download-btn" onClick={() => window.print()}>
                <FaDownload /> Download PDF
              </button>
              <button className="btn btn-primary btn-sm" id="invoice-print-btn" onClick={() => window.print()}>
                <FaPrint /> Print
              </button>
            </div>
          </div>

          {/* Invoice Document */}
          <div className="glass-card-strong" id="invoice-doc" style={{ padding: '2.5rem' }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>
                  Vegetable<span style={{ color: '#14B8A6' }}>Tonnes</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>B2B Agricultural Exchange Platform</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px', lineHeight: 1.6 }}>
                  GSTIN: 29AABCV1234M1Z5<br />
                  support@vegetabletonnes.com
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#14B8A6' }}>TAX INVOICE</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>{invoice.invoiceNumber}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                  Date: {new Date(invoice.generatedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(20,184,166,0.20)', marginBottom: '1.5rem' }} />

            {/* Billing Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bill To</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{invoice.buyerName}</div>
                <div style={{ fontSize: '0.82rem', color: '#0f766e', fontWeight: 600, marginTop: '2px' }}>GSTIN: {invoice.buyerGstin}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px', lineHeight: 1.6 }}>{invoice.buyerAddress}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Order Details</div>
                <div style={{ fontSize: '0.82rem', color: '#0f172a' }}>Order: <strong>{invoice.orderId}</strong></div>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(20,184,166,0.20)' }}>
                    {['Description', 'Grade', 'Qty (Tons)', 'Rate/Ton', 'Amount'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px', textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{invoice.commodity}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{invoice.variety}</div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: '#0f766e', fontWeight: 600 }}>{invoice.grade}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>{invoice.quantity}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>₹{invoice.pricePerTon?.toLocaleString()}</td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>₹{invoice.subtotal?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 280 }}>
                {[
                  { l: 'Subtotal', v: `₹${invoice.subtotal?.toLocaleString()}` },
                  { l: `CGST (${invoice.gstRate / 2}%)`, v: `₹${Math.round(invoice.gstAmount / 2).toLocaleString()}` },
                  { l: `SGST (${invoice.gstRate / 2}%)`, v: `₹${Math.round(invoice.gstAmount / 2).toLocaleString()}` },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.88rem', color: '#64748B' }}>
                    <span>{r.l}</span><span>{r.v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'rgba(20,184,166,0.25)', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#14B8A6' }}>₹{invoice.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginTop: '2rem', marginBottom: '1rem' }} />
            <div style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'center' }}>
              This is a computer generated invoice and does not require a physical signature. · VegetableTonnes Agri Exchange Pvt. Ltd.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Invoices;
