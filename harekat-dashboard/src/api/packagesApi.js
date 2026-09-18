import { get } from './client.js';

export const packagesApi = {
  getMyPackages: () => get('/packages/my', { auth: true }),
  listPackages: () => get('/packages', { auth: false })
};

export default packagesApi;
