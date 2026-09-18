import { get, post } from './client.js';

export const examsApi = {
  getExam: (courseId) => get(`/exams/course/${courseId}/student`, { auth: true }),
  submitExam: (courseId) => post(`/exams/course/${courseId}/submit`, {}, { auth: true })
};

export default examsApi;
