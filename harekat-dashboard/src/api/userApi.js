import { get, put } from './client.js';

export const userApi = {
  getUserById: (id) => get(`/users/${id}`, { auth: true }),
  updateUser: (id, userData) => put(`/users/${id}`, userData, { auth: true })
};

export default userApi;
