// client/src/services/api.js
import axios from 'axios';
import store from '@/store';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    const token = store.getters['auth/getToken'];
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('API Error:', error.response ? error.response.data : error);
    if (error.response && error.response.status === 401) {
      store.dispatch('auth/logout');
    }
    return Promise.reject(error);
  }
);

export default api;