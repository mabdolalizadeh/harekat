import { get, post } from './client.js';

export const paymentsApi = {
  getMyPayments: () => get('/payments/my', { auth: true }),
  initiatePayment: (orderId, gateway = 'mock', returnUrl = '') =>
    post('/payments/initiate', { orderId, gateway, returnUrl }, { auth: true }),
  verifyPayment: (paymentId, transactionId) =>
    post(`/payments/${paymentId}/verify`, { transactionId }, { auth: true }),
  processFakePayment: (paymentId, action = 'pay', transactionId, reason) =>
    post('/payments/fake/process', { paymentId, action, transactionId, reason }, { auth: true })
};

export default paymentsApi;
