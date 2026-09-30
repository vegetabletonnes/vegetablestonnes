import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Ensures Razorpay Checkout script is loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay Standard Web Checkout
 * @param {Object} options
 * @param {number} options.amountInRupees - Amount in INR (e.g. 500)
 * @param {string} [options.orderId] - Internal Order ID (if applicable)
 * @param {string} [options.commodity] - Commodity name or description
 * @param {Object} [options.user] - Buyer user info { name, email, phone, company }
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {Function} [options.onDismiss] - Modal closed callback
 */
export const openRazorpayCheckout = async ({
  amountInRupees,
  orderId,
  commodity,
  user,
  onSuccess,
  onError,
  onDismiss,
}) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Failed to load Razorpay payment SDK. Please check your internet connection.');
      if (onError) onError(new Error('SDK failed to load'));
      return;
    }

    const token = localStorage.getItem('vt_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Convert amount to paise (1 Rupee = 100 Paise)
    const amountInPaise = Math.round(Number(amountInRupees) * 100);

    if (amountInPaise < 100) {
      toast.error('Amount must be at least ₹1.00');
      if (onError) onError(new Error('Minimum amount ₹1.00'));
      return;
    }

    toast.loading('Initializing secure payment gateway...', { id: 'rzp-init' });

    // 2. Call backend to create Razorpay Order
    const createOrderResponse = await axios.post(
      '/api/create-order',
      {
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderId ? `rcpt_${orderId.slice(0, 10)}` : undefined,
        orderId,
        notes: {
          commodity: commodity || 'Produce Order',
          buyerName: user?.name || 'Buyer',
        }
      },
      { headers }
    );

    toast.dismiss('rzp-init');

    const { order_id, amount, currency, key_id } = createOrderResponse.data;
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || key_id;

    if (!razorpayKey) {
      toast.error('Razorpay Key ID is not configured.');
      if (onError) onError(new Error('Missing Razorpay Key'));
      return;
    }

    // 3. Configure Razorpay Standard Checkout options
    const razorpayOptions = {
      key: razorpayKey,
      amount: amount,
      currency: currency || 'INR',
      name: 'VegetableTonnes',
      description: commodity ? `Payment for ${commodity} (${orderId || ''})` : `Order Payment ${orderId || ''}`,
      image: '/logo.png',
      order_id: order_id,
      prefill: {
        name: user?.name || user?.company || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      notes: {
        orderId: orderId || '',
        platform: 'VegetableTonnes B2B',
      },
      theme: {
        color: '#14B8A6',
      },
      modal: {
        ondismiss: () => {
          toast('Payment cancelled', { icon: 'ℹ️' });
          if (onDismiss) onDismiss();
        },
      },
      handler: async (response) => {
        // 4. On payment success, send signatures to backend to verify
        const verifyToastId = toast.loading('Verifying payment signature...');
        try {
          const verifyResponse = await axios.post(
            '/api/verify-payment',
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
              amount: amountInRupees,
            },
            { headers }
          );

          toast.dismiss(verifyToastId);

          if (verifyResponse.data.success) {
            toast.success(`Payment verified! Reference: ${response.razorpay_payment_id}`);
            if (onSuccess) onSuccess(verifyResponse.data);
          } else {
            toast.error(verifyResponse.data.error || 'Payment signature verification failed.');
            if (onError) onError(new Error(verifyResponse.data.error));
          }
        } catch (verifyErr) {
          toast.dismiss(verifyToastId);
          const errMsg = verifyErr.response?.data?.error || verifyErr.message || 'Signature verification error';
          toast.error(`Verification Failed: ${errMsg}`);
          if (onError) onError(verifyErr);
        }
      },
    };

    const rzp = new window.Razorpay(razorpayOptions);

    rzp.on('payment.failed', (response) => {
      console.error('Razorpay Payment Failed:', response.error);
      toast.error(`Payment failed: ${response.error?.description || response.error?.reason || 'Transaction declined'}`);
      if (onError) onError(response.error);
    });

    rzp.open();
  } catch (err) {
    toast.dismiss('rzp-init');
    console.error('Error opening Razorpay checkout:', err);
    const msg = err.response?.data?.error || err.message || 'Failed to initialize payment';
    toast.error(msg);
    if (onError) onError(err);
  }
};
