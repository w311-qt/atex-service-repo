import axios from 'axios';
import { useAuthStore } from '@/store/auth';

// Создаем экземпляр axios с базовыми настройками
export const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Добавляем перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(
  config => {
    const authStore = useAuthStore();
    const token = authStore.getToken;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для обработки ошибок аутентификации
api.interceptors.response.use(
  response => response,
  async error => {
    const authStore = useAuthStore();

    // Если получили 401 ошибку, то выходим из системы
    if (error.response && error.response.status === 401) {
      authStore.logout();
    }

    return Promise.reject(error);
  }
);

// Сервис для работы с API
export const apiService = {
  // Auth API
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    me: () => api.get('/auth/me')
  },

  // Users API
  users: {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (userData) => api.post('/users', userData),
    update: (id, userData) => api.patch(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
    getTechnicians: () => api.get('/users/technicians')
  },

  // Equipment API
  equipment: {
    getAll: (params) => api.get('/equipment', { params }),
    getById: (id) => api.get(`/equipment/${id}`),
    create: (data) => api.post('/equipment', data),
    update: (id, data) => api.patch(`/equipment/${id}`, data),
    delete: (id) => api.delete(`/equipment/${id}`),
    assign: (id, data) => api.post(`/equipment/${id}/assign`, data),
    uploadImage: (id, formData) => api.post(`/equipment/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    // Категории
    getCategories: () => api.get('/equipment/categories'),
    createCategory: (data) => api.post('/equipment/categories', data),
    updateCategory: (id, data) => api.patch(`/equipment/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/equipment/categories/${id}`),
    // Статусы
    getStatuses: () => api.get('/equipment/statuses'),
    createStatus: (data) => api.post('/equipment/statuses', data),
    updateStatus: (id, data) => api.patch(`/equipment/statuses/${id}`, data),
    deleteStatus: (id) => api.delete(`/equipment/statuses/${id}`),
    // Характеристики
    getSpecifications: (equipmentId) => api.get(`/equipment/${equipmentId}/specifications`),
    createSpecification: (equipmentId, data) => api.post(`/equipment/${equipmentId}/specifications`, data),
    updateSpecification: (equipmentId, specId, data) => api.patch(`/equipment/${equipmentId}/specifications/${specId}`, data),
    deleteSpecification: (equipmentId, specId) => api.delete(`/equipment/${equipmentId}/specifications/${specId}`)
  },

  // Requests API
  requests: {
    getAll: (params) => api.get('/requests', { params }),
    getById: (id) => api.get(`/requests/${id}`),
    create: (data) => api.post('/requests', data),
    update: (id, data) => api.patch(`/requests/${id}`, data),
    delete: (id) => api.delete(`/requests/${id}`),
    changeStatus: (id, data) => api.post(`/requests/${id}/status`, data),
    assign: (id, data) => api.post(`/requests/${id}/assign`, data),
    addComment: (id, data) => api.post(`/requests/${id}/comment`, data),
    complete: (id, data) => api.post(`/requests/${id}/complete`, data),
    cancel: (id, data) => api.post(`/requests/${id}/cancel`, data),
    getActivities: (id) => api.get(`/requests/${id}/activities`),
    // Статусы заявок
    getStatuses: () => api.get('/request-statuses'),
    // Типы заявок
    getTypes: () => api.get('/request-types'),
    // Приоритеты заявок
    getPriorities: () => api.get('/request-priorities')
  },

  // Files API
  files: {
    upload: (formData) => api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    delete: (filename) => api.delete(`/files/${filename}`)
  }
};
