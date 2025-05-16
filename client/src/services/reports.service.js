import api from './api';

/**
 * Reports service for handling API requests related to reports
 */
class ReportsService {
  /**
   * Get equipment report from the API
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Report data
   */
  async getEquipmentReport(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add category IDs if provided
      if (params.categoryIds && params.categoryIds.length > 0) {
        params.categoryIds.forEach(id => {
          queryParams.append('categoryIds[]', id);
        });
      }

      // Add status IDs if provided
      if (params.statusIds && params.statusIds.length > 0) {
        params.statusIds.forEach(id => {
          queryParams.append('statusIds[]', id);
        });
      }

      // Add date filters if provided
      if (params.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }

      if (params.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }

      // Make request
      const response = await api.get(`/reports/equipment?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment report:', error);
      throw error;
    }
  }

  /**
   * Get request report from the API
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Report data
   */
  async getRequestReport(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add status IDs if provided
      if (params.statusIds && params.statusIds.length > 0) {
        params.statusIds.forEach(id => {
          queryParams.append('statusIds[]', id);
        });
      }

      // Add type IDs if provided
      if (params.typeIds && params.typeIds.length > 0) {
        params.typeIds.forEach(id => {
          queryParams.append('typeIds[]', id);
        });
      }

      // Add assigned user IDs if provided
      if (params.assignedToIds && params.assignedToIds.length > 0) {
        params.assignedToIds.forEach(id => {
          queryParams.append('assignedToIds[]', id);
        });
      }

      // Add date filters if provided
      if (params.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }

      if (params.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }

      // Make request
      const response = await api.get(`/reports/requests?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request report:', error);
      throw error;
    }
  }

  /**
   * Export equipment report to Excel
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Response with blob data
   */
  async exportEquipmentReport(params = {}) {
    try {
      return await api.post('/reports/export/equipment', params, {
        responseType: 'blob'
      });
    } catch (error) {
      console.error('Error exporting equipment report:', error);
      throw error;
    }
  }

  /**
   * Export request report to Excel
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Response with blob data
   */
  async exportRequestReport(params = {}) {
    try {
      return await api.post('/reports/export/requests', params, {
        responseType: 'blob'
      });
    } catch (error) {
      console.error('Error exporting request report:', error);
      throw error;
    }
  }
}

export default new ReportsService();