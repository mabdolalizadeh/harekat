import { get, post, put, del } from './client.js';

export const cartApi = {
  getCart: () => get('/cart', { auth: true }),
  addToCart: (productId, productType, quantity, price) =>
    post('/cart/add', { productId, productType, quantity, price }, { auth: true }),
  updateCartItem: (itemId, quantity) =>
    put(`/cart/item/${itemId}`, { quantity }, { auth: true }),
  removeFromCart: (itemId) =>
    del(`/cart/item/${itemId}`, { auth: true }),
  clearCart: () =>
    del('/cart/clear', { auth: true }),
  validateCoupon: (code, orderAmount) =>
    post('/coupons/validate', { code, orderAmount }, { auth: true })
};

export default cartApi;
