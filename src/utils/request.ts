import { extend } from 'umi-request';

const isProd = import.meta.env.PROD;
const API_URL = isProd 
  ? 'https://family-chat-backend-m58u.onrender.com/api' 
  : 'http://127.0.0.1:5000/api';

const request = extend({
  prefix: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('token');
  if (token) {
    return { url, options: { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } } };
  }
  return { url, options };
});

request.interceptors.response.use(async (response) => {
  // Don't redirect on 401 for login endpoint — let the login page show the error
  if (response.status === 401 && !response.url.includes('/auth/login')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return response;
});

export default request;