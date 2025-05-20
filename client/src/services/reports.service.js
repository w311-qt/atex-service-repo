import api from './api';

class ReportsService {
  async exportEquipmentReport(params) {
    try {
      console.log('Calling equipment export API with params:', params);
      const response = await api.post('/reports/equipment/export', params, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting equipment report:', error);
      throw error;
    }
  }

  async exportRequestsReport(params) {
    try {
      console.log('Calling requests export API with params:', params);
      const response = await api.post('/reports/requests/export', params, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting requests report:', error);
      throw error;
    }
  }

  downloadFile(blob, filename) {
    try {
      console.log('Downloading file:', filename);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}

export default new ReportsService();