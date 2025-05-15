import dashboardService from '@/services/dashboard.service';

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
      // Получаем общую статистику через сервис
      const data = await dashboardService.getStatistics();

      // Проверяем, что получены корректные данные
      if (data) {
        console.log('Получены данные статистики:', data);
        commit('SET_STATISTICS', data);
        return data;
      } else {
        console.warn('API вернул пустые данные для статистики');
        commit('SET_STATISTICS', {
          equipmentTotal: 0,
          activeRequests: 0,
          workingEquipment: 0,
          needAttention: 0,
          categoryStats: [],
          statusStats: []
        });
        return null;
      }
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
      commit('SET_ERROR', error.message || 'Ошибка при получении статистики');
      commit('SET_STATISTICS', {
        equipmentTotal: 0,
        activeRequests: 0,
        workingEquipment: 0,
        needAttention: 0,
        categoryStats: [],
        statusStats: []
      });
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение последних заявок
  async fetchRecentRequests({ commit }) {
    commit('SET_LOADING', true);
    try {
      // Получаем последние заявки через сервис
      const requests = await dashboardService.getRecentRequests(5);

      // Проверяем полученные данные
      if (requests && requests.length > 0) {
        console.log('Получены последние заявки:', requests);
        commit('SET_RECENT_REQUESTS', requests);
        return requests;
      } else {
        console.warn('API вернул пустой список заявок');
        commit('SET_RECENT_REQUESTS', []);
        return [];
      }
    } catch (error) {
      console.error('Ошибка при получении последних заявок:', error);
      commit('SET_ERROR', error.message || 'Ошибка при получении последних заявок');
      commit('SET_RECENT_REQUESTS', []);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение последних активностей
  async fetchRecentActivities({ commit }) {
    commit('SET_LOADING', true);
    try {
      // Получаем последние активности через сервис
      const activities = await dashboardService.getRecentActivities(5);

      // Проверяем полученные данные
      if (activities && activities.length > 0) {
        console.log('Получены последние активности:', activities);
        commit('SET_RECENT_ACTIVITIES', activities);
        return activities;
      } else {
        console.warn('API вернул пустой список активностей');
        commit('SET_RECENT_ACTIVITIES', []);
        return [];
      }
    } catch (error) {
      console.error('Ошибка при получении последних активностей:', error);
      commit('SET_ERROR', error.message || 'Ошибка при получении последних активностей');
      commit('SET_RECENT_ACTIVITIES', []);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение оборудования, требующего внимания
  async fetchAttentionEquipment({ commit }) {
    commit('SET_LOADING', true);
    try {
      // Получаем оборудование, требующее внимания, через сервис
      const equipment = await dashboardService.getAttentionEquipment(5);

      // Проверяем полученные данные
      if (equipment && equipment.length > 0) {
        console.log('Получено оборудование, требующее внимания:', equipment);
        commit('SET_ATTENTION_EQUIPMENT', equipment);
        return equipment;
      } else {
        console.warn('API вернул пустой список оборудования, требующего внимания');
        commit('SET_ATTENTION_EQUIPMENT', []);
        return [];
      }
    } catch (error) {
      console.error('Ошибка при получении оборудования, требующего внимания:', error);
      commit('SET_ERROR', error.message || 'Ошибка при получении оборудования, требующего внимания');
      commit('SET_ATTENTION_EQUIPMENT', []);
      return [];
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