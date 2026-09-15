import { get } from './client.js';

export const bannersApi = {
  getBanners: () => get('/banners', { auth: false })
};

export default bannersApi;
