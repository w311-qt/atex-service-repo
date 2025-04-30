// client/src/store/modules/dashboard.js
import api from '@/services/api';

export default {
  namespaced: true,
  state: {
    statistics: {},
    recentRequests: [],
    recentActivities: [],
    attentionEquipment: []
  },
  mutations: {
    SET_STATISTICS(state, statistics) {
      state.statistics = statistics;
    },
    SET_RECENT_REQUESTS(state, requests) {
      state.recentRequests = requests;
    },
    SET_RECENT_ACTIVITIES(state, activities) {
      state.recentActivities = activities;
    },
    SET_ATTENTION_EQUIPMENT(state, equipment) {
      state.attentionEquipment = equipment;
    }
  },
  actions: {
    async fetchStatistics({ commit }) {
      try {
        const response = await api.get('/dashboard/statistics');
        commit('SET_STATISTICS', response.data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    async fetchRecentRequests({ commit }) {
      try {
        const response = await api.get('/dashboard/recent-requests');
        commit('SET_RECENT_REQUESTS', response.data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    async fetchRecentActivities({ commit }) {
      try {
        const response = await api.get('/dashboard/recent-activities');
        commit('SET_RECENT_ACTIVITIES', response.data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    async fetchAttentionEquipment({ commit }) {
      try {
        const response = await api.get('/dashboard/attention-equipment');
        commit('SET_ATTENTION_EQUIPMENT', response.data);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },
  getters: {
    statistics: state => state.statistics,
    recentRequests: state => state.recentRequests,
    recentActivities: state => state.recentActivities,
    attentionEquipment: state => state.attentionEquipment
  }
};