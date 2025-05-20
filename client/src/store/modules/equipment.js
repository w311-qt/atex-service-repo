import api from '@/services/api';

const state = {
  equipmentList: [],
  totalEquipment: 0,
  currentEquipment: null,
  categories: [],
  statuses: [],
  loading: false,
  error: null
};

const getters = {
  allEquipment: state => state.equipmentList,
  equipmentById: state => id => state.equipmentList.find(item => item.id === id),
  totalEquipment: state => state.totalEquipment,
  currentEquipment: state => state.currentEquipment,

  allCategories: state => state.categories,
  categoryById: state => id => state.categories.find(category => category.id === id),

  allStatuses: state => state.statuses,
  statusById: state => id => state.statuses.find(status => status.id === id),

  loading: state => state.loading,
  error: state => state.error
};

const actions = {
  async fetchEquipment({ commit }, params = {}) {
    const shouldForce = params.force === true;

    if (shouldForce) {
      console.log('Принудительный запрос оборудования из API (force=true)');
      commit('SET_EQUIPMENT_LIST', []); // Очищаем перед запросом
    }

    commit('SET_LOADING', true);

    try {
      const response = await api.get('/equipment', {
        params: { ...params, _nocache: shouldForce ? Date.now() : undefined }
      });

      if (response.data && 'data' in response.data) {
        commit('SET_EQUIPMENT_LIST', response.data.data);
        commit('SET_TOTAL_EQUIPMENT', response.data.total);
        console.log(`Получено ${response.data.data.length} единиц оборудования из API`);
      } else if (Array.isArray(response.data)) {
        commit('SET_EQUIPMENT_LIST', response.data);
        commit('SET_TOTAL_EQUIPMENT', response.data.length);
        console.log(`Получено ${response.data.length} единиц оборудования из API (массив)`);
      } else {
        console.warn('Неожиданный формат данных от API:', response.data);
        commit('SET_EQUIPMENT_LIST', []);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      commit('SET_ERROR', error.message || 'Error fetching equipment');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchEquipmentById({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get(`/equipment/${id}`);
      commit('SET_CURRENT_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении данных оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createEquipment({ commit }, equipmentData) {
    commit('SET_LOADING', true);

    try {
      console.log('Creating equipment with data:', equipmentData);
      const response = await api.post('/equipment', equipmentData);
      console.log('Response after creating equipment:', response.data);

      // Добавляем созданное оборудование в хранилище
      if (response.data && response.data.id) {
        commit('ADD_EQUIPMENT', response.data);
      } else {
        console.warn('Response does not contain equipment data with ID');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating equipment:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при создании оборудования';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateEquipment({ commit }, { id, equipmentData }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.patch(`/equipment/${id}`, equipmentData);
      commit('UPDATE_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при обновлении оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Удаление оборудования
  async deleteEquipment({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      await api.delete(`/equipment/${id}`);
      commit('REMOVE_EQUIPMENT', id);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при удалении оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Назначение оборудования пользователю
  async assignEquipment({ commit }, { id, userId }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.post(`/equipment/${id}/assign`, { userId });
      commit('UPDATE_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при назначении оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async uploadEquipmentImage({ commit }, { id, imageFile }) {
    commit('SET_LOADING', true);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post(`/equipment/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      commit('UPDATE_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при загрузке изображения');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchCategories({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get('/categories');
      commit('SET_CATEGORIES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error fetching categories');
      commit('SET_CATEGORIES', []);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchCategoriesWithCount({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('categories/count');
      commit('SET_CATEGORIES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении категорий');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Создание категории
  async createCategory({ commit }, categoryData) {
    commit('SET_LOADING', true);

    try {
      const response = await api.post('categories', categoryData);
      commit('ADD_CATEGORY', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при создании категории');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Обновление категории
  async updateCategory({ commit }, { id, categoryData }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.patch(`categories/${id}`, categoryData);
      commit('UPDATE_CATEGORY', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при обновлении категории');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteCategory({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      await api.delete(`categories/${id}`);
      commit('REMOVE_CATEGORY', id);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при удалении категории');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchStatuses({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get('/statuses');
      commit('SET_STATUSES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error fetching statuses');
      commit('SET_STATUSES', []);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchStatusesWithCount({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/equipment/statuses/count');
      commit('SET_STATUSES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении статусов');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createStatus({ commit }, statusData) {
    commit('SET_LOADING', true);

    try {
      const response = await api.post('/equipment/statuses', statusData);
      commit('ADD_STATUS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при создании статуса');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateStatus({ commit }, { id, statusData }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.patch(`/equipment/statuses/${id}`, statusData);
      commit('UPDATE_STATUS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при обновлении статуса');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteStatus({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      await api.delete(`/equipment/statuses/${id}`);
      commit('REMOVE_STATUS', id);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при удалении статуса');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async changeEquipmentStatus({ commit }, { id, statusId }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.patch(`/equipment/${id}/status`, { statusId });
      commit('UPDATE_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при изменении статуса оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  resetCurrentEquipment({ commit }) {
    commit('SET_CURRENT_EQUIPMENT', null);
  }
};

const mutations = {
  SET_EQUIPMENT_LIST(state, equipmentList) {
    state.equipmentList = equipmentList;
  },

  SET_TOTAL_EQUIPMENT(state, total) {
    state.totalEquipment = total;
  },

  SET_CURRENT_EQUIPMENT(state, equipment) {
    state.currentEquipment = equipment;
  },

  ADD_EQUIPMENT(state, equipment) {
    // Проверяем, существует ли массив оборудования
    if (!Array.isArray(state.equipmentList)) {
      state.equipmentList = [];
    }

    // Добавляем оборудование в начало списка
    state.equipmentList.unshift(equipment);

    state.totalEquipment++;

    console.log('Оборудование добавлено в хранилище:', equipment);
  },

  UPDATE_EQUIPMENT(state, updatedEquipment) {
    const index = state.equipmentList.findIndex(item => item.id === updatedEquipment.id);
    if (index !== -1) {
      state.equipmentList.splice(index, 1, updatedEquipment);
    }

    // Обновляем текущее оборудование, если оно совпадает с обновленным
    if (state.currentEquipment && state.currentEquipment.id === updatedEquipment.id) {
      state.currentEquipment = updatedEquipment;
    }
  },

  REMOVE_EQUIPMENT(state, id) {
    state.equipmentList = state.equipmentList.filter(item => item.id !== id);
    state.totalEquipment--;

    // Сбрасываем текущее оборудование, если оно было удалено
    if (state.currentEquipment && state.currentEquipment.id === id) {
      state.currentEquipment = null;
    }
  },

  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },

  ADD_CATEGORY(state, category) {
    state.categories.push(category);
  },

  UPDATE_CATEGORY(state, updatedCategory) {
    const index = state.categories.findIndex(item => item.id === updatedCategory.id);
    if (index !== -1) {
      state.categories.splice(index, 1, updatedCategory);
    }
  },

  REMOVE_CATEGORY(state, id) {
    state.categories = state.categories.filter(item => item.id !== id);
  },

  SET_STATUSES(state, statuses) {
    state.statuses = statuses;
  },

  ADD_STATUS(state, status) {
    state.statuses.push(status);
  },

  UPDATE_STATUS(state, updatedStatus) {
    const index = state.statuses.findIndex(item => item.id === updatedStatus.id);
    if (index !== -1) {
      state.statuses.splice(index, 1, updatedStatus);
    }
  },

  REMOVE_STATUS(state, id) {
    state.statuses = state.statuses.filter(item => item.id !== id);
  },

  SET_LOADING(state, loading) {
    state.loading = loading;
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