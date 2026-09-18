import { post } from './client.js';

export const authApi = {
  requestOtp: (phoneNumber) => post('/auth', { phoneNumber }, { auth: false }),
  validateOtp: (phoneNumber, otp) => post('/auth/validate-otp', { phoneNumber, otp }, { auth: false }),
  changePhoneNumber: (phoneNumber) => post('/auth/change-phone-number', { phoneNumber }, { auth: true })
};

export default authApi;
