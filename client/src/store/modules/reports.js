import reportsService from '@/services/reports.service';

const state = {
  equipmentReport: null,
  requestReport: null,
  loading: false,
  error: null
};

const getters = {
  equipmentReport: state => state.equipmentReport,
  requestReport: state => state.requestReport,
  loading: state => state.loading,
  error: state => state.error
};

const actions = {
  /**
   * Get equipment report
   */
  async getEquipmentReport({ commit }, params = {}) {
    commit('SET_LOADING', true);

    try {
      const response = await reportsService.getEquipmentReport(params);
      commit('SET_EQUIPMENT_REPORT', response);
      return response;
    } catch (error) {
      console.error('Error fetching equipment report:', error);
      commit('SET_ERROR', error.message || 'Error fetching equipment report');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Get request report
   */
  async getRequestReport({ commit }, params = {}) {
    commit('SET_LOADING', true);

    try {
      const response = await reportsService.getRequestReport(params);
      commit('SET_REQUEST_REPORT', response);
      return response;
    } catch (error) {
      console.error('Error fetching request report:', error);
      commit('SET_ERROR', error.message || 'Error fetching request report');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Export equipment report to Excel
   */
  async exportEquipmentReport({ commit }, params = {}) {
    commit('SET_LOADING', true);

    try {
      const response = await reportsService.exportEquipmentReport(params);
      return response;
    } catch (error) {
      console.error('Error exporting equipment report:', error);
      commit('SET_ERROR', error.message || 'Error exporting equipment report');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Export request report to Excel
   */
  async exportRequestReport({ commit }, params = {}) {
    commit('SET_LOADING', true);

    try {
      const response = await reportsService.exportRequestReport(params);
      return response;
    } catch (error) {
      console.error('Error exporting request report:', error);
      commit('SET_ERROR', error.message || 'Error exporting request report');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  /**
   * Clear reports data
   */
  clearReportsData({ commit }) {
    commit('SET_EQUIPMENT_REPORT', null);
    commit('SET_REQUEST_REPORT', null);
  }
};
