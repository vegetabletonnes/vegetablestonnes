import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';
import supabase from '../db/supabase.js';
import { getRazorpayInstance, verifyRazorpaySignature } from '../utils/razorpay.js';

const router = Router();

/**
 * Controller: Create Razorpay Order
 * POST /api/payments/create-order OR POST /api/create-order
 */
export const handleCreateRazorpayOrder = async (req, res) => {
  try {
    let { amount, currency = 'INR', receipt, orderId, notes = {} } = req.body;

    // If orderId provided and amount not given, try fetching total_value from orders table
    if (orderId && (!amount || Number(amount) <= 0)) {
      const { data: dbOrder, error: dbError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!dbError && dbOrder && dbOrder.total_value) {
        // Convert rupees from DB into paise (1 Rupee = 100 paise)
        amount = Math.round(Number(dbOrder.total_value) * 100);
      }
    }

    // Validation: amount must be provided and >= 100 paise
    if (!amount || Number(amount) < 100) {
      return res.status(400).json({
        error: 'Invalid amount. Minimum amount required is 100 paise (₹1.00).'
      });
    }

    const numericAmount = Math.round(Number(amount));
    const receiptId = receipt || (orderId ? `rcpt_${orderId.slice(0, 8)}_${Date.now()}` : `rcpt_${Date.now()}`);

    const razorpay = getRazorpayInstance();

    const options = {
      amount: numericAmount,
      currency: currency.toUpperCase(),
      receipt: receiptId.slice(0, 40), // Razorpay receipt max 40 chars
      notes: {
        ...notes,
        ...(orderId ? { orderId } : {}),
        platform: 'VegetableTonnes'
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      receipt: razorpayOrder.receipt
    });
  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    const isAuthFailure = err.statusCode === 401 || err.error?.code === 'BAD_REQUEST_ERROR' && err.error?.description?.toLowerCase().includes('auth');
    if (isAuthFailure) {
      return res.status(401).json({
        error: 'Razorpay authentication failed. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
      });
    }
    res.status(500).json({
      error: err.error?.description || err.message || 'Failed to create Razorpay order'
    });
  }
};

/**
 * Controller: Verify Razorpay Payment Signature
 * POST /api/payments/verify OR POST /api/verify-payment
 */
export const handleVerifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      order_id,
      razorpay_payment_id,
      payment_id,
      razorpay_signature,
      signature,
      orderId,
      amount
    } = req.body;

    const rzpOrderId = razorpay_order_id || order_id;
    const rzpPaymentId = razorpay_payment_id || payment_id;
    const rzpSignature = razorpay_signature || signature;

    // Validate presence of required fields
    if (!rzpOrderId || !rzpPaymentId || !rzpSignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required Razorpay fields (razorpay_order_id, razorpay_payment_id, razorpay_signature).'
      });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(rzpOrderId, rzpPaymentId, rzpSignature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: signature mismatch'
      });
    }

    // Signature verified successfully!
    let paymentRecord = null;
    let invoiceRecord = null;

    // If orderId is linked, update database status, create payment & invoice records
    if (orderId) {
      try {
        const { data: dbOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        // Update order status to payment_successful
        await supabase
          .from('orders')
          .update({ status: 'payment_successful' })
          .eq('id', orderId);

        const paymentAmount = amount ? (Number(amount) > 1000 ? Number(amount) / 100 : Number(amount)) : (dbOrder?.total_value || 0);

        // Record payment in payments table
        const { data: newPayment } = await supabase
          .from('payments')
          .insert([{
            order_id: orderId,
            amount: paymentAmount,
            status: 'completed',
            payment_method: 'razorpay',
            transaction_id: rzpPaymentId
          }])
          .select()
          .single();

        paymentRecord = newPayment;

        // Generate invoice if not exists
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (!existingInvoice) {
          const { data: newInvoice } = await supabase
            .from('invoices')
            .insert([{
              order_id: orderId,
              invoice_number: `VT/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
            }])
            .select()
            .single();

          invoiceRecord = newInvoice;
        } else {
          invoiceRecord = existingInvoice;
        }

        // Notify buyer if authenticated or order exists
        const buyerId = req.user?.id || dbOrder?.buyer_id;
        if (buyerId) {
          await createNotification(
            buyerId,
            'payment_received',
            'Payment Verified',
            `Razorpay payment of ₹${paymentAmount.toLocaleString()} confirmed (ID: ${rzpPaymentId}) for Order ${orderId}.`,
            { paymentId: paymentRecord?.id, orderId, razorpayPaymentId: rzpPaymentId }
          );

          if (invoiceRecord) {
            await createNotification(
              buyerId,
              'invoice_generated',
              'Invoice Generated',
              `Invoice ${invoiceRecord.invoice_number} is ready for Order ${orderId}.`,
              { invoiceId: invoiceRecord.id, orderId }
            );
          }
        }
      } catch (dbErr) {
        console.warn('DB recording warning after successful Razorpay verification:', dbErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: rzpPaymentId,
      order_id: rzpOrderId,
      payment: paymentRecord,
      invoice: invoiceRecord
    });
  } catch (err) {
    console.error('Razorpay Verify Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Payment verification failed'
    });
  }
};

// Mount Razorpay routes on router
router.post('/create-order', handleCreateRazorpayOrder);
router.post('/verify', handleVerifyRazorpayPayment);
router.post('/verify-payment', handleVerifyRazorpayPayment);

// Standard simulated/legacy routes
router.post('/initiate', verifyToken, async (req, res) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId || !method) return res.status(400).json({ error: 'orderId and method required' });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('buyer_id', req.user.id)
      .single();

    if (orderError || !order) return res.status(404).json({ error: 'Order not found' });

    if (!['accepted', 'approved', 'payment_pending'].includes(order.status)) {
      return res.status(400).json({ error: 'Order must be accepted before payment' });
    }

    await supabase
      .from('orders')
      .update({ status: 'payment_pending' })
      .eq('id', orderId);

    const paymentData = {
      order_id: orderId,
      amount: order.total_value,
      status: 'pending',
      payment_method: method,
      transaction_id: `TXN${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    };

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) throw paymentError;

    res.json({ 
      payment: {
        id: payment.id,
        orderId: payment.order_id,
        buyerId: req.user.id,
        amount: payment.amount,
        method: payment.payment_method,
        status: payment.status,
        reference: payment.transaction_id,
        createdAt: payment.created_at
      }, 
      message: 'Payment initiated' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/confirm', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.body;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, orders!inner(buyer_id)')
      .eq('id', paymentId)
      .eq('orders.buyer_id', req.user.id)
      .single();

    if (paymentError || !payment) return res.status(404).json({ error: 'Payment not found' });

    const { data: updatedPayment, error: updatePaymentError } = await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', paymentId)
      .select()
      .single();

    if (updatePaymentError) throw updatePaymentError;

    await supabase
      .from('orders')
      .update({ status: 'payment_successful' })
      .eq('id', payment.order_id);

    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', payment.order_id)
      .single();

    let invoice = existingInvoice;

    if (!invoice) {
      const invoiceData = {
        order_id: payment.order_id,
        invoice_number: `VT/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
      };

      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invoiceError) throw invoiceError;
      invoice = newInvoice;
    }

    createNotification(
      req.user.id,
      'payment_received',
      'Payment Successful',
      `Payment of Rs.${updatedPayment.amount?.toLocaleString()} confirmed for Order ${payment.order_id}.`,
      { paymentId, orderId: payment.order_id }
    );

    if (invoice) {
      createNotification(
        req.user.id,
        'invoice_generated',
        'Invoice Generated',
        `Invoice ${invoice.invoice_number} is ready for Order ${payment.order_id}.`,
        { invoiceId: invoice.id, orderId: payment.order_id }
      );
    }

    res.json({ 
      payment: {
        id: updatedPayment.id,
        orderId: updatedPayment.order_id,
        amount: updatedPayment.amount,
        status: updatedPayment.status,
        method: updatedPayment.payment_method,
        reference: updatedPayment.transaction_id,
        createdAt: updatedPayment.created_at
      }, 
      invoice, 
      message: 'Payment confirmed' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*, orders!inner(buyer_id)')
      .eq('orders.buyer_id', req.user.id);
      
    if (error) throw error;

    const formatted = (payments || []).map(p => ({
      id: p.id,
      orderId: p.order_id,
      buyerId: p.orders?.buyer_id,
      amount: p.amount,
      status: p.status,
      method: p.payment_method,
      reference: p.transaction_id,
      createdAt: p.created_at
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*');
      
    if (error) throw error;
    res.json(payments || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
