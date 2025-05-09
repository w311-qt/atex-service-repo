// client/src/store/modules/equipment.js
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
  // Получение списка оборудования с фильтрацией и пагинацией
  async fetchEquipment({ commit }, params = {}) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/equipment', { params });
      commit('SET_EQUIPMENT_LIST', response.data.data);
      commit('SET_TOTAL_EQUIPMENT', response.data.total);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении списка оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение оборудования по ID
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

  // Создание нового оборудования
  async createEquipment({ commit }, equipmentData) {
    commit('SET_LOADING', true);

    try {
      const response = await api.post('/equipment', equipmentData);
      commit('ADD_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при создании оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Обновление оборудования
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

  // Загрузка изображения для оборудования
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

  // Получение списка категорий
  async fetchCategories({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/equipment/categories');
      commit('SET_CATEGORIES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении категорий');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение списка категорий с количеством оборудования
  async fetchCategoriesWithCount({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/equipment/categories/count');
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
      const response = await api.post('/equipment/categories', categoryData);
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
      const response = await api.patch(`/equipment/categories/${id}`, categoryData);
      commit('UPDATE_CATEGORY', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при обновлении категории');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Удаление категории
  async deleteCategory({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      await api.delete(`/equipment/categories/${id}`);
      commit('REMOVE_CATEGORY', id);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при удалении категории');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение списка статусов
  async fetchStatuses({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/equipment/statuses');
      commit('SET_STATUSES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении статусов');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение списка статусов с количеством оборудования
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

  // Создание статуса
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

  // Обновление статуса
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

  // Удаление статуса
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

  // Изменение статуса оборудования
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

  // Сброс текущего выбранного оборудования
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
    state.equipmentList.push(equipment);
    state.totalEquipment++;
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