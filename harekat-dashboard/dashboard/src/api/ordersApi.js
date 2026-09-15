import { get, post } from './client.js';

export const ordersApi = {
  createOrder: (couponCode) => post('/orders', { couponCode: couponCode || null }, { auth: true }),
  getOrders: () => get('/orders', { auth: true }),
  getOrderById: (id) => get(`/orders/${id}`, { auth: true })
};

export default ordersApi;
