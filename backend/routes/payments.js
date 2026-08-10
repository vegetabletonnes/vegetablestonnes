import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

const paymentsPath = join(__dirname, '../data/payments.json');
const ordersPath = join(__dirname, '../data/orders.json');
const invoicesPath = join(__dirname, '../data/invoices.json');
const usersPath = join(__dirname, '../data/users.json');

const readPayments = () => JSON.parse(readFileSync(paymentsPath, 'utf-8'));
const writePayments = (data) => writeFileSync(paymentsPath, JSON.stringify(data, null, 2));
const readOrders = () => JSON.parse(readFileSync(ordersPath, 'utf-8'));
const writeOrders = (data) => writeFileSync(ordersPath, JSON.stringify(data, null, 2));
const readInvoices = () => JSON.parse(readFileSync(invoicesPath, 'utf-8'));
const writeInvoices = (data) => writeFileSync(invoicesPath, JSON.stringify(data, null, 2));
const readUsers = () => JSON.parse(readFileSync(usersPath, 'utf-8'));

router.post('/initiate', verifyToken, (req, res) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId || !method) return res.status(400).json({ error: 'orderId and method required' });

    const orders = readOrders();
    const ordersList = Array.isArray(orders) ? orders : (orders.orders || []);
    const orderIndex = ordersList.findIndex((order) => order.id === orderId && order.buyerId === req.user.id);
    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    const order = ordersList[orderIndex];
    if (!['accepted', 'approved'].includes(order.status)) {
      return res.status(400).json({ error: 'Order must be accepted before payment' });
    }

    ordersList[orderIndex].status = 'payment_pending';
    if (Array.isArray(orders)) writeOrders(ordersList);
    else writeOrders({ ...orders, orders: ordersList });

    const payments = readPayments();
    const paymentList = Array.isArray(payments) ? payments : (payments.payments || []);
    const payment = {
      id: `PAY${Date.now()}`,
      orderId,
      buyerId: req.user.id,
      buyerName: req.user.name || order.buyerName,
      amount: order.totalValue,
      method,
      status: 'initiated',
      reference: `TXN${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };

    paymentList.push(payment);
    writePayments(Array.isArray(payments) ? paymentList : { ...payments, payments: paymentList });

    res.json({ payment, message: 'Payment initiated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/confirm', verifyToken, (req, res) => {
  try {
    const { paymentId } = req.body;
    const paymentsRaw = readPayments();
    const paymentList = Array.isArray(paymentsRaw) ? paymentsRaw : (paymentsRaw.payments || []);
    const paymentIndex = paymentList.findIndex((payment) => payment.id === paymentId && payment.buyerId === req.user.id);
    if (paymentIndex === -1) return res.status(404).json({ error: 'Payment not found' });

    paymentList[paymentIndex].status = 'successful';
    paymentList[paymentIndex].confirmedAt = new Date().toISOString();
    writePayments(Array.isArray(paymentsRaw) ? paymentList : { ...paymentsRaw, payments: paymentList });

    const ordersRaw = readOrders();
    const ordersList = Array.isArray(ordersRaw) ? ordersRaw : (ordersRaw.orders || []);
    const orderIndex = ordersList.findIndex((order) => order.id === paymentList[paymentIndex].orderId);
    let invoice = null;

    if (orderIndex !== -1) {
      ordersList[orderIndex].status = 'payment_successful';
      ordersList[orderIndex].paymentId = paymentId;

      const invoices = readInvoices();
      invoice = invoices.find((item) => item.orderId === ordersList[orderIndex].id) || null;

      if (!invoice) {
        const users = readUsers();
        const userList = Array.isArray(users) ? users : (users.users || []);
        const buyer = userList.find((user) => user.id === ordersList[orderIndex].buyerId);
        const subtotal = ordersList[orderIndex].totalValue || 0;
        const gstRate = 5;
        const gstAmount = Math.round(subtotal * 0.05);

        invoice = {
          id: `INV-VT-${Date.now()}`,
          invoiceNumber: `VT/${new Date().getFullYear()}/${String(invoices.length + 1).padStart(4, '0')}`,
          orderId: ordersList[orderIndex].id,
          buyerId: ordersList[orderIndex].buyerId,
          buyerName: buyer?.name || ordersList[orderIndex].buyerName || '',
          buyerGstin: buyer?.gstin || ordersList[orderIndex].buyerGstin || 'N/A',
          buyerAddress: ordersList[orderIndex].destination || buyer?.location || 'N/A',
          commodity: ordersList[orderIndex].commodity,
          variety: ordersList[orderIndex].variety || '',
          grade: ordersList[orderIndex].grade || '',
          quantity: ordersList[orderIndex].quantity,
          pricePerTon: ordersList[orderIndex].bidPrice,
          subtotal,
          gstRate,
          gstAmount,
          total: subtotal + gstAmount,
          status: 'generated',
          generatedAt: new Date().toISOString(),
          generatedBy: 'system',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        invoices.push(invoice);
        writeInvoices(invoices);
      }

      ordersList[orderIndex].invoiceId = invoice.id;
      ordersList[orderIndex].status = 'confirmed';
      writeOrders(Array.isArray(ordersRaw) ? ordersList : { ...ordersRaw, orders: ordersList });
    }

    createNotification(
      req.user.id,
      'payment_received',
      'Payment Successful',
      `Payment of Rs.${paymentList[paymentIndex].amount?.toLocaleString()} confirmed for Order ${paymentList[paymentIndex].orderId}.`,
      { paymentId, orderId: paymentList[paymentIndex].orderId }
    );

    if (invoice) {
      createNotification(
        req.user.id,
        'invoice_generated',
        'Invoice Generated',
        `Invoice ${invoice.invoiceNumber} is ready for Order ${paymentList[paymentIndex].orderId}.`,
        { invoiceId: invoice.id, orderId: paymentList[paymentIndex].orderId }
      );
    }

    res.json({ payment: paymentList[paymentIndex], invoice, message: 'Payment confirmed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', verifyToken, (req, res) => {
  try {
    const payments = readPayments();
    const paymentList = Array.isArray(payments) ? payments : (payments.payments || []);
    res.json(paymentList.filter((payment) => payment.buyerId === req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', verifyToken, requireAdmin, (req, res) => {
  try {
    const payments = readPayments();
    res.json(Array.isArray(payments) ? payments : (payments.payments || []));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
