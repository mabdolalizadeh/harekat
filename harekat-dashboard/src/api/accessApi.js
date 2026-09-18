import { get } from './client.js';

export const accessApi = {
  getMyAccessibleCourses: () => get('/access/my-courses', { auth: true }),
  getRecommendedCourse: () => get('/access/recommended', { auth: true })
};

export default accessApi;
