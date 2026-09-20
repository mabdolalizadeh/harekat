import { get, post } from './client.js';

export const quizzesApi = {
  getCourseQuizzes: (courseId) => get(`/quizzes/course/${courseId}/student`, { auth: true }),
  takeQuiz: (quizId) => get(`/quizzes/${quizId}/take`, { auth: true }),
  submitQuiz: (quizId, payload) => post(`/quizzes/${quizId}/submit`, payload, { auth: true }),
};

export default quizzesApi;
