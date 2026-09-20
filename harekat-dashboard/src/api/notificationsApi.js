import { get, post } from './client.js';

export const notificationsApi = {
  getMyNotifications: () => get('/notifications/my', { auth: true }),
  markAsRead: (id) => post(`/notifications/${id}/read`, {}, { auth: true }),
  markAllAsRead: () => post('/notifications/read-all', {}, { auth: true })
};

export default notificationsApi;
