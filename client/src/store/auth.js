import { defineStore } from 'pinia';
import { api } from '@/services/api';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isTechnician: (state) => state.user?.role === 'technician',
    isUser: (state) => state.user?.role === 'user',
    getUser: (state) => state.user,
    getToken: (state) => state.token
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/auth/login', credentials);
        this.setAuthData(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при входе в систему';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/auth/register', userData);
        this.setAuthData(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при регистрации';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.user = null;
      this.token = null;

      // Перенаправление на страницу входа
      if (router.currentRoute.value.meta.requiresAuth) {
        router.push({ name: 'Login' });
      }
    },

    async checkAuth() {
      if (!this.token) return false;

      try {
        const response = await api.get('/auth/me');
        this.user = response.data;
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    },

    setAuthData(data) {
      this.token = data.access_token;
      this.user = data.user;
    }
  },

  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['token', 'user']
  }
});