import { get } from './client.js';

export const licensesApi = {
  getMyLicenses: () => get('/licenses/my', { auth: true }),
  getLicenseById: (id) => get(`/licenses/${id}`, { auth: false })
};

export default licensesApi;
