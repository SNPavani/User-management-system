import axios from 'axios';
import API from './config';

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const forgotPasswordRequest = async (phone) => {
  try {
    const response = await api.post('/api/auth/forgot-password-request', { phone });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const verifyOTP = async (phone, otp_code) => {
  try {
    const response = await api.post('/api/auth/verify-otp', { phone, otp_code });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const resendOTP = async (phone) => {
  try {
    const response = await api.post('/api/auth/resend-otp', { phone });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const resetPassword = async (phone, new_password, reset_token) => {
  try {
    const response = await api.post('/api/auth/reset-password', {
      phone,
      new_password,
      reset_token
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export default api;
