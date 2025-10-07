import { extend } from 'umi-request';

const request = extend({
//   prefix: 'http://localhost:5000/api',
  prefix: 'https://family-chat-backend-m58u.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return {
      url,
      options: {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      },
    };
  }
  
  return { url, options };
});

// Response interceptor
request.interceptors.response.use(async (response) => {
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return response;
});

export default request;