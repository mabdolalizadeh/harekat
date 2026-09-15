import { get } from './client.js';

export const coursesApi = {
  getCourses: () => get('/courses', { auth: false }),
  getCourseById: (id) => get(`/courses/${id}`, { auth: false }),
  getCategories: () => get('/categories', { auth: false }),
  getTeachers: () => get('/teachers', { auth: false })
};

export default coursesApi;
