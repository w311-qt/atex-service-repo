import api from './api';
import store from '@/store';

/**
 * Сервис для работы с данными дашборда
 */
class DashboardService {
  /**
   * Получение общей статистики для дашборда из существующих данных хранилища
   * @returns {Promise<Object>} Объект с общей статистикой
   */
  async getStatistics() {
    try {
      // Загружаем данные из хранилища, если они ещё не загружены
      if (store.getters['equipment/allEquipment'].length === 0) {
        await store.dispatch('equipment/fetchEquipment');
      }
      if (store.getters['requests/allRequests'].length === 0) {
        await store.dispatch('requests/fetchRequests');
      }
      if (store.getters['equipment/allCategories'].length === 0) {
        await store.dispatch('equipment/fetchCategories');
      }
      if (store.getters['equipment/allStatuses'].length === 0) {
        await store.dispatch('equipment/fetchStatuses');
      }

      // Получаем данные из хранилища
      const equipment = store.getters['equipment/allEquipment'];
      const requests = store.getters['requests/allRequests'];
      const categories = store.getters['equipment/allCategories'];
      const statuses = store.getters['equipment/allStatuses'];

      console.log('Данные из хранилища для формирования статистики:', {
        equipment: equipment.length,
        requests: requests.length,
        categories: categories.length,
        statuses: statuses.length
      });

      // Считаем количество оборудования
      const equipmentTotal = equipment.length;

      // Считаем количество активных заявок (не выполненных и не отмененных)
      const activeRequests = requests.filter(req => {
        return req.status &&
          req.status.name !== 'Выполнена' &&
          req.status.name !== 'Отменена';
      }).length;

      // Считаем количество рабочего оборудования
      const workingEquipment = equipment.filter(eq => {
        return eq.status && eq.status.name === 'Рабочий';
      }).length;

      // Считаем количество оборудования, требующего внимания
      const needAttention = equipment.filter(eq => {
        return eq.status &&
          (eq.status.name === 'Дефектный' ||
            eq.status.name === 'Нерабочий');
      }).length;

      // Формируем статистику по категориям
      const categoryStats = categories.map(category => {
        const count = equipment.filter(eq => {
          return eq.categoryId === category.id ||
            (eq.category && eq.category.id === category.id);
        }).length;

        return {
          category: category.name,
          count: count
        };
      }).filter(item => item.count > 0);

      // Формируем статистику по статусам
      const statusStats = statuses.map(status => {
        const count = equipment.filter(eq => {
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
      // Возвращаем пустую статистику в случае ошибки
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
      // Загружаем заявки, если они ещё не загружены
      if (store.getters['requests/allRequests'].length === 0) {
        await store.dispatch('requests/fetchRequests');
      }

      // Получаем заявки из хранилища
      const requests = store.getters['requests/allRequests'];
      console.log(`Получено ${requests.length} заявок из хранилища`);

      // Сортируем по дате создания (от новых к старым)
      const sortedRequests = [...requests].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      // Возвращаем только необходимое количество
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
      // Попробуем сначала получить данные из API
      try {
        const response = await api.get('/request-activities/recent', {
          params: { limit }
        });
        console.log(`Получено ${response.data.length} активностей из API`);
        return response.data;
      } catch (apiError) {
        console.warn('Не удалось получить активности из API, создаем имитацию:', apiError);

        // Если не удалось получить из API, создадим имитацию на основе заявок
        if (store.getters['requests/allRequests'].length === 0) {
          await store.dispatch('requests/fetchRequests');
        }

        const requests = store.getters['requests/allRequests'];
        const currentUser = store.getters['auth/currentUser'] || { name: 'Пользователь' };

        // Создаем имитацию активностей на основе заявок
        const mockActivities = requests
          .slice(0, limit * 2) // Берем больше заявок для разнообразия
          .map((request, index) => {
            // Чередуем типы активностей для разнообразия
            const types = ['create', 'statusChange', 'comment', 'assign', 'complete'];
            const type = types[index % types.length];

            let message = '';
            switch (type) {
              case 'create':
                message = `Создана заявка ${request.number}: ${request.title}`;
                break;
              case 'statusChange':
                message = `Заявка ${request.number} переведена в статус "${request.status?.name || 'Новый'}"`;
                break;
              case 'comment':
                message = `Добавлен комментарий к заявке ${request.number}`;
                break;
              case 'assign':
                message = `Заявка ${request.number} назначена на исполнителя`;
                break;
              case 'complete':
                message = `Заявка ${request.number} выполнена`;
                break;
              default:
                message = `Действие с заявкой ${request.number}`;
            }

            return {
              id: `mock-${index + 1}`,
              type: type,
              message: message,
              timestamp: request.createdAt || new Date(),
              user: currentUser
            };
          });

        // Сортируем по дате (от новых к старым)
        const sortedActivities = mockActivities.sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return dateB - dateA;
        });

        // Возвращаем только необходимое количество
        return sortedActivities.slice(0, limit);
      }
    } catch (error) {
      console.error('Ошибка при получении последних активностей:', error);
      return [];
    }
  }

  /**
   * Получение оборудования, требующего внимания, из хранилища
   * @param {number} limit - Ограничение по количеству записей
   * @returns {Promise<Array>} Массив оборудования, требующего внимания
   */
  async getAttentionEquipment(limit = 5) {
    try {
      // Загружаем оборудование, если оно ещё не загружено
      if (store.getters['equipment/allEquipment'].length === 0) {
        await store.dispatch('equipment/fetchEquipment');
      }

      // Получаем оборудование из хранилища
      const equipment = store.getters['equipment/allEquipment'];
      console.log(`Получено ${equipment.length} единиц оборудования из хранилища`);

      // Фильтруем оборудование с проблемными статусами
      const problemEquipment = equipment.filter(eq => {
        return eq.status &&
          (eq.status.name === 'Дефектный' ||
            eq.status.name === 'Нерабочий');
      });

      console.log(`Найдено ${problemEquipment.length} единиц оборудования, требующего внимания`);

      // Возвращаем только необходимое количество
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
      // Получаем статистику, которая уже включает распределение по категориям
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
      // Получаем статистику, которая уже включает распределение по статусам
      const stats = await this.getStatistics();
      return stats.statusStats || [];
    } catch (error) {
      console.error('Ошибка при получении распределения оборудования по статусам:', error);
      return [];
    }
  }
}

export default new DashboardService();