import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

const invoicesPath = join(__dirname, '../data/invoices.json');
const ordersPath   = join(__dirname, '../data/orders.json');

const readInvoices = () => JSON.parse(readFileSync(invoicesPath, 'utf-8'));
const writeInvoices = (d) => writeFileSync(invoicesPath, JSON.stringify(d, null, 2));
const readOrders = () => JSON.parse(readFileSync(ordersPath, 'utf-8'));
const writeOrders = (d) => writeFileSync(ordersPath, JSON.stringify(d, null, 2));

const getOrdersList = (raw) => Array.isArray(raw) ? raw : (raw.orders || []);
const getInvList = (raw) => Array.isArray(raw) ? raw : [];

// POST /api/invoices/generate/:orderId — admin generates invoice
router.post('/generate/:orderId', verifyToken, requireAdmin, (req, res) => {
  try {
    const ordersRaw = readOrders();
    const ordersList = getOrdersList(ordersRaw);
    const order = ordersList.find(o => o.id === req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const invoices = readInvoices();
    const existing = invoices.find(i => i.orderId === req.params.orderId);
    if (existing) return res.json(existing);

    const subtotal = order.totalValue || 0;
    const gstRate = 0.05;
    const gstAmount = Math.round(subtotal * gstRate);
    const total = subtotal + gstAmount;

    const invoice = {
      id: 'INV-VT-' + Date.now(),
      invoiceNumber: 'VT/' + new Date().getFullYear() + '/' + String(invoices.length + 1).padStart(4, '0'),
      orderId: order.id,
      buyerId: order.buyerId,
      buyerName: order.buyerName || order.buyerCompany || '',
      buyerGstin: order.buyerGstin || 'N/A',
      buyerAddress: order.destination || 'N/A',
      commodity: order.commodity,
      variety: order.variety || '',
      grade: order.grade || '',
      quantity: order.quantity,
      pricePerTon: order.bidPrice,
      subtotal,
      gstRate: gstRate * 100,
      gstAmount,
      total,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.name || 'Admin',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    invoices.push(invoice);
    writeInvoices(invoices);

    // Update order with invoiceId
    const oIdx = ordersList.findIndex(o => o.id === req.params.orderId);
    if (oIdx !== -1) {
      ordersList[oIdx].invoiceId = invoice.id;
      if (ordersList[oIdx].status === 'payment_successful') ordersList[oIdx].status = 'confirmed';
      writeOrders(Array.isArray(ordersRaw) ? ordersList : { ...ordersRaw, orders: ordersList });
    }

    createNotification(
      order.buyerId, 'invoice_generated', 'Invoice Generated',
      `GST Invoice ${invoice.invoiceNumber} for Order ${order.id} is ready.`,
      { invoiceId: invoice.id, orderId: order.id }
    );

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/mine — buyer
router.get('/mine', verifyToken, (req, res) => {
  try {
    const invoices = readInvoices();
    res.json(invoices.filter(i => i.buyerId === req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', verifyToken, (req, res) => {
  try {
    const invoices = readInvoices();
    const invoice = invoices.find(i => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && invoice.buyerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices — admin all
router.get('/', verifyToken, requireAdmin, (req, res) => {
  try {
    res.json(readInvoices());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
