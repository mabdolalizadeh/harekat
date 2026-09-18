import { get, post } from './client.js';

export const paymentsApi = {
  getMyPayments: () => get('/payments/my', { auth: true }),
  initiatePayment: (orderId, gateway = 'mock', returnUrl = '') =>
    post('/payments/initiate', { orderId, gateway, returnUrl }, { auth: true }),
  verifyPayment: (paymentId) =>
    post(`/payments/${paymentId}/verify`, {}, { auth: true })
};

export default paymentsApi;
