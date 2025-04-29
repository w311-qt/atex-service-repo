// src/store/modules/auth.js
import api from '@/services/api';
import router from '@/router';

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    SET_USER(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    CLEAR_AUTH(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    // Авторизация пользователя
    async login({ commit }, credentials) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        const response = await api.post('/auth/login', credentials);

        if (response.data && response.data.access_token) {
          commit('SET_TOKEN', response.data.access_token);
          commit('SET_USER', response.data.user);

          // Установка токена для всех последующих запросов
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

          return response.data;
        } else {
          throw new Error('Некорректный ответ сервера при авторизации');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка авторизации';
        commit('SET_ERROR', errorMessage);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Выход из системы
    logout({ commit }) {
      commit('CLEAR_AUTH');
      delete api.defaults.headers.common['Authorization'];
      router.push('/login');
    },

    // Получение информации о текущем пользователе
    async fetchCurrentUser({ commit, state }) {
      if (!state.token) return;

      commit('SET_LOADING', true);
      try {
        const response = await api.get('/users/me');
        commit('SET_USER', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        // Если токен недействителен, выходим из системы
        if (error.response && error.response.status === 401) {
          commit('CLEAR_AUTH');
          delete api.defaults.headers.common['Authorization'];
          router.push('/login');
        }
        commit('SET_ERROR', error.message || 'Ошибка при получении данных пользователя');
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Инициализация состояния авторизации
    initAuth({ commit, state }) {
      if (state.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    isAdmin: state => state.user && state.user.role === 'admin',
    isTechnician: state => state.user && state.user.role === 'technician',
    isUser: state => state.user && state.user.role === 'user',
    userRole: state => state.user ? state.user.role : null,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
