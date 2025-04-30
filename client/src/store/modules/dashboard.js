import api from '@/services/api';

const state = {
  statistics: {
    equipmentTotal: 0,
    activeRequests: 0,
    workingEquipment: 0,
    needAttention: 0,
    categoryStats: [],
    statusStats: []
  },
  recentRequests: [],
  recentActivities: [],
  attentionEquipment: [],
  loading: false,
  error: null
};

const getters = {
  statistics: state => state.statistics,
  recentRequests: state => state.recentRequests,
  recentActivities: state => state.recentActivities,
  attentionEquipment: state => state.attentionEquipment,
  loading: state => state.loading
};

const actions = {
  // Получение общей статистики для дашборда
  async fetchStatistics({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get('/dashboard/statistics');
      commit('SET_STATISTICS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении статистики');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение последних заявок
  async fetchRecentRequests({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get('/dashboard/recent-requests');
      commit('SET_RECENT_REQUESTS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении последних заявок');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение последних активностей
  async fetchRecentActivities({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get('/dashboard/recent-activities');
      commit('SET_RECENT_ACTIVITIES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении последних активностей');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение оборудования, требующего внимания
  async fetchAttentionEquipment({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get('/dashboard/attention-equipment');
      commit('SET_ATTENTION_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении оборудования, требующего внимания');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Загрузка всех данных для дашборда одним вызовом
  async fetchAllDashboardData({ dispatch }) {
    try {
      await Promise.all([
        dispatch('fetchStatistics'),
        dispatch('fetchRecentRequests'),
        dispatch('fetchRecentActivities'),
        dispatch('fetchAttentionEquipment')
      ]);
    } catch (error) {
      console.error('Ошибка при загрузке данных для дашборда:', error);
      throw error;
    }
  }
};

const mutations = {
  SET_STATISTICS(state, data) {
    state.statistics = data;
  },

  SET_RECENT_REQUESTS(state, data) {
    state.recentRequests = data;
  },

  SET_RECENT_ACTIVITIES(state, data) {
    state.recentActivities = data;
  },

  SET_ATTENTION_EQUIPMENT(state, data) {
    state.attentionEquipment = data;
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