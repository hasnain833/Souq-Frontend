import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function createPayPalOrder({ amount, currency = 'USD', metadata = {} }) {
  const url = `${API_BASE_URL}/api/user/paypal/create-order`;
  const res = await axios.post(url, { amount, currency, metadata }, { withCredentials: true });
  return res.data; // { success, orderId, order }
}

export async function capturePayPalOrder({ orderId }) {
  const url = `${API_BASE_URL}/api/user/paypal/capture-order`;
  const res = await axios.post(url, { orderId }, { withCredentials: true });
  return res.data; // { success, status, transactionId, payer, capture }
}


