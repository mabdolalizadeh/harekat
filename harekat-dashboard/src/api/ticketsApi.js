import { get, post } from './client.js';

export const ticketsApi = {
  getMyTickets: () => get('/tickets/my', { auth: true }),
  createTicket: (payload) => post('/tickets', payload, { auth: true }),
  getTicketById: (id) => get(`/tickets/${id}`, { auth: true }),
  replyTicket: (id, message) => post(`/tickets/${id}/messages`, { message }, { auth: true })
};

export default ticketsApi;
