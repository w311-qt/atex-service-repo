import api from './api';
import store from '@/store';

/**
 * Dashboard.vue
 */
class DashboardService {
  /**
   * Получение общей статистики для дашборда из существующих данных хранилища
   * @returns {Promise<Object>} Объект с общей статистикой
   */
  async getStatistics() {
    try {
      const equipment = store.getters['equipment/allEquipment'] || [];
      const requests = store.getters['requests/allRequests'] || [];
      const categories = store.getters['equipment/allCategories'] || [];
      const statuses = store.getters['equipment/allStatuses'] || [];

      if (equipment.length === 0) {
        await store.dispatch('equipment/fetchEquipment');
      }
      if (requests.length === 0) {
        await store.dispatch('requests/fetchRequests');
      }
      if (categories.length === 0) {
        await store.dispatch('equipment/fetchCategories');
      }
      if (statuses.length === 0) {
        await store.dispatch('equipment/fetchStatuses');
      }

      const updatedEquipment = store.getters['equipment/allEquipment'] || [];
      const updatedRequests = store.getters['requests/allRequests'] || [];
      const updatedCategories = store.getters['equipment/allCategories'] || [];
      const updatedStatuses = store.getters['equipment/allStatuses'] || [];

      console.log('Данные из хранилища для формирования статистики:', {
        equipment: updatedEquipment.length,
        requests: updatedRequests.length,
        categories: updatedCategories.length,
        statuses: updatedStatuses.length
      });

      // DEBUG
      console.log('Структура первых 3-х единиц оборудования:',
        updatedEquipment.slice(0, 3).map(eq => ({
          id: eq.id,
          name: eq.name,
          status: eq.status,
          statusId: eq.statusId,
          statusStr: typeof eq.status === 'object' ? eq.status?.name : 'не объект'
        }))
      );

      // DEBUG
      console.log('Доступные статусы:',
        updatedStatuses.map(s => ({
          id: s.id,
          name: s.name,
          nameLower: s.name?.toLowerCase()
        }))
      );

      const equipmentTotal = updatedEquipment.length;

      const activeRequests = updatedRequests.filter(req => {
        if (req.status && typeof req.status === 'object') {
          return req.status.name !== 'Выполнена' && req.status.name !== 'Отменена';
        }
        const statusObj = updatedStatuses.find(s => s.id === req.statusId);
        return statusObj && statusObj.name !== 'Выполнена' && statusObj.name !== 'Отменена';
      }).length;

      const workingStatusPatterns = ['рабочее', 'новый'];
      const excludedStatusList = ['Нерабочее', 'Дефектное'];

      const workingStatusIds = updatedStatuses
        .filter(s => !excludedStatusList.includes(s.name))
        .map(s => s.id);

      console.log('ID рабочих статусов:', workingStatusIds);

      const attentionStatusPatterns = ['дефект', 'нерабоч', 'проблем', 'внимани', 'defect', 'fault', 'error'];

      const attentionStatusIds = updatedStatuses
        .filter(s => {
          if (['Дефектный', 'Дефектное', 'Нерабочий', 'Нерабочее'].includes(s.name))
            return true;

          const nameLower = s.name?.toLowerCase() || '';
          return attentionStatusPatterns.some(pattern => nameLower.includes(pattern));
        })
        .map(s => s.id);

      console.log('ID проблемных статусов:', attentionStatusIds);

      const workingEquipment = updatedEquipment.filter(eq => {
        if (eq.status && typeof eq.status === 'object') {
          const statusName = eq.status.name?.toLowerCase() || '';
          if (workingStatusPatterns.some(pattern => statusName.includes(pattern))) {
            return true;
          }
        }

        return workingStatusIds.includes(eq.statusId);
      }).length;

      console.log('Количество рабочего оборудования:', workingEquipment);

      const needAttention = updatedEquipment.filter(eq => {
        if (eq.status && typeof eq.status === 'object') {
          const statusName = eq.status.name?.toLowerCase() || '';
          if (attentionStatusPatterns.some(pattern => statusName.includes(pattern))) {
            return true;
          }
        }

        return attentionStatusIds.includes(eq.statusId);
      }).length;

      console.log('Количество оборудования, требующего внимания:', needAttention);

      const categoryStats = updatedCategories.map(category => {
        const count = updatedEquipment.filter(eq => {
          return eq.categoryId === category.id ||
            (eq.category && eq.category.id === category.id);
        }).length;

        return {
          category: category.name,
          count: count
        };
      }).filter(item => item.count > 0);

      const statusStats = updatedStatuses.map(status => {
        const count = updatedEquipment.filter(eq => {
          return eq.statusId === status.id ||
            (eq.status && eq.status.id === status.id);
        }).length;

        return {
          status: status.name,
          count: count
        };
      }).filter(item => item.count > 0);

      const result = {
        equipmentTotal,
        activeRequests,
        workingEquipment,
        needAttention,
        categoryStats,
        statusStats
      };

      console.log('Сформирована статистика из хранилища:', result);
      return result;
    } catch (error) {
      console.error('Ошибка при формировании статистики из хранилища:', error);
      return {
        equipmentTotal: 0,
        activeRequests: 0,
        workingEquipment: 0,
        needAttention: 0,
        categoryStats: [],
        statusStats: []
      };
    }
  }

  /**
   * Получение последних заявок из хранилища
   * @param {number} limit - Ограничение по количеству записей
   * @returns {Promise<Array>} Массив последних заявок
   */
  async getRecentRequests(limit = 5) {
    try {
      if (store.getters['requests/allRequests'].length === 0) {
        await store.dispatch('requests/fetchRequests');
      }

      const requests = store.getters['requests/allRequests'];
      console.log(`Получено ${requests.length} заявок из хранилища`);

      const sortedRequests = [...requests].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      const result = sortedRequests.slice(0, limit);
      console.log(`Возвращаем ${result.length} последних заявок`);
      return result;
    } catch (error) {
      console.error('Ошибка при получении последних заявок из хранилища:', error);
      return [];
    }
  }

  /**
   * Получение последних активностей
   * @param {number} limit - Ограничение по количеству записей
   * @returns {Promise<Array>} Массив последних активностей
   */
  async getRecentActivities(limit = 5) {
    try {
      const response = await api.get('/request-activities/recent', {
        params: { limit } });
      console.log(`Получено ${response.data.length} активностей из API`);
      return response.data;
    } catch (apiError) {
      console.warn('Не удалось получить активности из API, создаем имитацию:', apiError);
    }
  }

  /**
   * Получение оборудования, требующего внимания, из хранилища
   * @param {number} limit - Ограничение по количеству записей
   * @returns {Promise<Array>} Массив оборудования, требующего внимания
   */
  async getAttentionEquipment(limit = 5) {
    try {
      if (store.getters['equipment/allEquipment'].length === 0) {
        await store.dispatch('equipment/fetchEquipment');
      }

      const equipment = store.getters['equipment/allEquipment'];
      console.log(`Получено ${equipment.length} единиц оборудования из хранилища`);

      const problemEquipment = equipment.filter(eq => {
        return eq.status &&
          (eq.status.name === 'Дефектный' ||
            eq.status.name === 'Нерабочий');
      });

      console.log(`Найдено ${problemEquipment.length} единиц оборудования, требующего внимания`);

      return problemEquipment.slice(0, limit);
    } catch (error) {
      console.error('Ошибка при получении оборудования, требующего внимания:', error);
      return [];
    }
  }

  /**
   * Получение распределения оборудования по категориям
   * @returns {Promise<Array>} Массив с распределением оборудования по категориям
   */
  async getEquipmentByCategory() {
    try {
      const stats = await this.getStatistics();
      return stats.categoryStats || [];
    } catch (error) {
      console.error('Ошибка при получении распределения оборудования по категориям:', error);
      return [];
    }
  }

  /**
   * Получение распределения оборудования по статусам
   * @returns {Promise<Array>} Массив с распределением оборудования по статусам
   */
  async getEquipmentByStatus() {
    try {
      const stats = await this.getStatistics();
      return stats.statusStats || [];
    } catch (error) {
      console.error('Ошибка при получении распределения оборудования по статусам:', error);
      return [];
    }
  }
}

export default new DashboardService();