import { get, post } from './client.js';

export const assignmentsApi = {
  getCourseAssignments: (courseId) => get(`/assignments/course/${courseId}/my`, { auth: true }),
  getAssignmentById: (id) => get(`/assignments/${id}`, { auth: true }),
  submitAssignment: (assignmentId, payload) => post(`/assignments/${assignmentId}/submit`, payload, { auth: true }),
};

export default assignmentsApi;
