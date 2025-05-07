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
  // Всегда возвращает true для тестирования
  isAuthenticated: () => true,
  isAdmin: () => true,
  isTechnician: () => true,
  isUser: () => true,
  currentUser: () => ({
    id: 'test-user-id',
    name: 'Тестовый пользователь',
    email: 'test@example.com',
    role: 'admin'
  }),
  getToken: () => 'fake-jwt-token',
  authError: state => state.error,
  isLoading: state => state.loading
};

const actions = {
  // eslint-disable-next-line no-unused-vars
  async login({ commit }, credentials) {
    console.log('Вход с использованием заглушки:', credentials);

    commit('SET_LOADING', true);

    // Имитируем задержку для реалистичности
    await new Promise(resolve => setTimeout(resolve, 500));

    // Имитируем успешную авторизацию
    const fakeUser = {
      id: 'test-user-id',
      name: 'Тестовый пользователь',
      email: credentials.email,
      role: 'admin'
    };

    const fakeToken = 'fake-jwt-token';

    // Сохраняем данные в localStorage для совместимости
    localStorage.setItem('auth_token', fakeToken);
    localStorage.setItem('auth_user', JSON.stringify(fakeUser));

    // Обновляем состояние
    commit('SET_AUTH_DATA', { token: fakeToken, user: fakeUser });
    commit('SET_LOADING', false);

    return fakeUser;
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

  async checkAuth({ commit }) {
    console.log('Проверка авторизации с использованием заглушки');

    // Имитируем валидный токен
    const fakeUser = {
      id: 'test-user-id',
      name: 'Тестовый пользователь',
      email: 'test@example.com',
      role: 'admin'
    };

    const fakeToken = 'fake-jwt-token';

    // Обновляем состояние
    commit('SET_AUTH_DATA', { token: fakeToken, user: fakeUser });

    return true;
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