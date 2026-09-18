import { get } from './client.js';

export const subscriptionsApi = {
  getMySubscription: () => get('/subscriptions/my', { auth: true }),
  getSubscriptions: () => get('/subscriptions', { auth: false }),
  getSubscriptionById: (id) => get(`/subscriptions/${id}`, { auth: false })
};

export default subscriptionsApi;
