import { get } from './client.js';

export const sessionsApi = {
  getCourseSessions: (courseId) => get(`/sessions/course/${courseId}/student`, { auth: true })
};

export default sessionsApi;
