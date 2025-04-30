// client/src/store/modules/users.js
import api from '@/services/api';

const state = {
  users: [],
  technicians: [],
  totalUsers: 0,
  currentUser: null,
  loading: false,
  error: null
};

const getters = {
  allUsers: state => state.users,
  totalUsers: state => state.totalUsers,
  allTechnicians: state => state.technicians,
  currentUser: state => state.currentUser,
  loading: state => state.loading,
  error: state => state.error,
  getUserById: state => id => state.users.find(user => user.id === id)
};

const actions = {
  // Получение списка пользователей с фильтрацией и пагинацией
  async fetchUsers({ commit }, params = {}) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/users', { params });
      commit('SET_USERS', response.data.data);
      commit('SET_TOTAL_USERS', response.data.total);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении списка пользователей');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение списка техников
  async fetchTechnicians({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/users/technicians');
      commit('SET_TECHNICIANS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении списка техников');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение пользователя по ID
  async fetchUserById({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get(`/users/${id}`);
      commit('SET_CURRENT_USER', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении данных пользователя');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Создание нового пользователя
  async createUser({ commit }, userData) {
    commit('SET_LOADING', true);

    try {
      const response = await api.post('/users', userData);
      commit('ADD_USER', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при создании пользователя');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Обновление пользователя
  async updateUser({ commit }, { id, userData }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.patch(`/users/${id}`, userData);
      commit('UPDATE_USER', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при обновлении пользователя');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Сброс пароля пользователя
  async resetPassword({ commit }, { id, password }) {
    commit('SET_LOADING', true);

    try {
      await api.post(`/users/${id}/reset-password`, { password });
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при сбросе пароля');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Изменение статуса пользователя (активировать/деактивировать)
  async toggleUserStatus({ commit }, { id, isActive }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.patch(`/users/${id}/status`, { isActive });
      commit('UPDATE_USER', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при изменении статуса пользователя');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const mutations = {
  SET_USERS(state, users) {
    state.users = users;
  },

  SET_TOTAL_USERS(state, count) {
    state.totalUsers = count;
  },

  SET_TECHNICIANS(state, technicians) {
    state.technicians = technicians;
  },

  SET_CURRENT_USER(state, user) {
    state.currentUser = user;
  },

  ADD_USER(state, user) {
    state.users.push(user);
  },

  UPDATE_USER(state, updatedUser) {
    const index = state.users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      state.users.splice(index, 1, updatedUser);
    }

    // Обновляем список техников, если пользователь там есть
    const techIndex = state.technicians.findIndex(tech => tech.id === updatedUser.id);
    if (techIndex !== -1) {
      if (updatedUser.role === 'technician') {
        state.technicians.splice(techIndex, 1, updatedUser);
      } else {
        state.technicians.splice(techIndex, 1);
      }
    } else if (updatedUser.role === 'technician') {
      state.technicians.push(updatedUser);
    }

    // Обновляем currentUser, если это тот же пользователь
    if (state.currentUser && state.currentUser.id === updatedUser.id) {
      state.currentUser = updatedUser;
    }
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