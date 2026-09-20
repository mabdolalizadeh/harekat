import { get, post } from './client.js';

export const evaluationsApi = {
  getMyEvaluation: (courseId) => get(`/evaluations/course/${courseId}/my`, { auth: true }),
  submitEvaluation: (courseId, payload) => post(`/evaluations/course/${courseId}/submit`, payload, { auth: true }),
};

export default evaluationsApi;
