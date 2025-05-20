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
  async fetchUsers({ commit }, params = {}) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/users', { params });

      if (Array.isArray(response.data)) {
        commit('SET_USERS', response.data);
        commit('SET_TOTAL_USERS', response.data.length);
      } else if (response.data && Array.isArray(response.data.data)) {
        commit('SET_USERS', response.data.data);
        commit('SET_TOTAL_USERS', response.data.total);
      } else {
        console.error('Unexpected response format:', response.data);
        commit('SET_USERS', []);
        commit('SET_TOTAL_USERS', 0);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при получении списка пользователей');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchTechnicians({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/users/technicians');
      commit('SET_TECHNICIANS', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching technicians:', error);
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при получении списка техников');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchUserById({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get(`/users/${id}`);
      commit('SET_CURRENT_USER', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при получении данных пользователя');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createUser({ commit }, userData) {
    commit('SET_LOADING', true);

    try {
      console.log('Creating user with data:', userData);
      const response = await api.post('/users', userData);
      console.log('Response after creating user:', response.data);

      commit('ADD_USER', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);

      if (error.response && error.response.status === 409) {
        commit('SET_ERROR', 'Пользователь с таким email уже существует');
      } else {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при создании пользователя');
      }

      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateUser({ commit }, { id, userData }) {
    commit('SET_LOADING', true);

    try {
      console.log('Updating user with data:', userData);
      const response = await api.patch(`/users/${id}`, userData);
      console.log('Response after updating user:', response.data);

      commit('UPDATE_USER', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);

      if (error.response && error.response.status === 409) {
        commit('SET_ERROR', 'Пользователь с таким email уже существует');
      } else {
        commit('SET_ERROR', error.response?.data?.message || 'Ошибка при обновлении пользователя');
      }

      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async resetPassword({ commit }, { id, password }) {
    commit('SET_LOADING', true);

    try {
      await api.post(`/users/${id}/reset-password`, { password });
    } catch (error) {
      console.error('Error resetting password:', error);
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при сбросе пароля');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async toggleUserStatus({ commit }, { id, isActive }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.patch(`/users/${id}/status`, { isActive });
      commit('UPDATE_USER', response.data);
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при изменении статуса пользователя');
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
    const index = state.users.findIndex(u => u.id === user.id);
    if (index === -1) {
      state.users.push(user);
    } else {
      state.users.splice(index, 1, user);
    }
  },

  UPDATE_USER(state, updatedUser) {
    const index = state.users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      state.users.splice(index, 1, updatedUser);
    }

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
