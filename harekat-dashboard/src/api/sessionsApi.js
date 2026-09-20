import { get, post } from './client.js';

export const sessionsApi = {
  getCourseSessions: (courseId) => get(`/sessions/course/${courseId}/student`, { auth: true }),
  updateProgress: (sessionId, payload) => post(`/sessions/${sessionId}/progress`, payload, { auth: true })
};

export default sessionsApi;

