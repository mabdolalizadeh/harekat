import { get } from './client.js';

export const subscriptionsApi = {
  getSubscriptions: () => get('/subscriptions', { auth: false }),
  getSubscriptionById: (id) => get(`/subscriptions/${id}`, { auth: false })
};

export default subscriptionsApi;
