// client/src/store/modules/auth.js
import api from '@/services/api';
import router from '@/router';

// Функция для получения данных из localStorage
const getStoredAuthData = () => {
  const token = localStorage.getItem('auth_token');
  const userString = localStorage.getItem('auth_user');
  let user = null;

  try {
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (e) {
    // Если произошла ошибка при парсинге, очищаем localStorage
    localStorage.removeItem('auth_user');
  }

  return { token, user };
};

// Начальное состояние
const { token, user } = getStoredAuthData();

const state = {
  token,
  user,
  loading: false,
  error: null
};

const getters = {
  isAuthenticated: state => !!state.token,
  isAdmin: state => state.user && state.user.role === 'admin',
  isTechnician: state => state.user && state.user.role === 'technician',
  isUser: state => state.user && state.user.role === 'user',
  currentUser: state => state.user,
  getToken: state => state.token,
  authError: state => state.error,
  isLoading: state => state.loading
};

const actions = {
  async login({ commit, dispatch }, credentials) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      console.log('Trying to login with:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);

      const { access_token, user } = response.data;

      // Проверяем структуру ответа
      if (!access_token || !user) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Неверный формат ответа от сервера');
      }

      commit('SET_AUTH_DATA', { token: access_token, user });

      // Сохраняем данные в localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login error details:', error);

      let errorMessage = 'Ошибка при входе в систему';
      if (error.response) {
        console.error('Server response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }

      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async register({ commit }, userData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка при регистрации';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  logout({ commit }) {
    // Удаляем данные из localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Очищаем состояние
    commit('CLEAR_AUTH_DATA');

    // Перенаправляем на страницу логина
    router.push('/login');
  },

  async checkAuth({ commit, state }) {
    if (!state.token) return false;

    try {
      const response = await api.get('/auth/me');
      commit('SET_USER', response.data);
      return true;
    } catch (error) {
      // Если токен недействителен, выполняем выход
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      commit('CLEAR_AUTH_DATA');
      return false;
    }
  },

  async updateProfile({ commit, state }, profileData) {
    commit('SET_LOADING', true);

    try {
      const response = await api.patch(`/users/${state.user.id}/profile`, profileData);

      // Обновляем данные пользователя
      const updatedUser = { ...state.user, ...response.data };
      commit('SET_USER', updatedUser);

      // Обновляем локальное хранилище
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка при обновлении профиля';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async changePassword({ commit, state }, { currentPassword, newPassword }) {
    commit('SET_LOADING', true);

    try {
      await api.post(`/users/${state.user.id}/change-password`, {
        currentPassword,
        newPassword
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ошибка при изменении пароля';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const mutations = {
  SET_AUTH_DATA(state, { token, user }) {
    state.token = token;
    state.user = user;
    state.error = null;
  },

  SET_USER(state, user) {
    state.user = user;
  },

  SET_TOKEN(state, token) {
    state.token = token;
  },

  CLEAR_AUTH_DATA(state) {
    state.token = null;
    state.user = null;
  },

  SET_LOADING(state, status) {
    state.loading = status;
  },

  SET_ERROR(state, error) {
    state.error = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
