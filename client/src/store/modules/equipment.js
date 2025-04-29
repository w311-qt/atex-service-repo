// src/store/modules/equipment.js
import api from '@/services/api';

export default {
  namespaced: true,
  state: {
    equipmentList: [],
    categories: [],
    statuses: [],
    loading: false,
    error: null,
    currentEquipment: null
  },
  mutations: {
    // Оборудование
    SET_EQUIPMENT(state, equipment) {
      state.equipmentList = equipment;
    },
    SET_CURRENT_EQUIPMENT(state, equipment) {
      state.currentEquipment = equipment;
    },
    ADD_EQUIPMENT(state, equipment) {
      state.equipmentList.push(equipment);
    },
    UPDATE_EQUIPMENT(state, updatedEquipment) {
      const index = state.equipmentList.findIndex(item => item.id === updatedEquipment.id);
      if (index !== -1) {
        state.equipmentList.splice(index, 1, updatedEquipment);
      }
      if (state.currentEquipment && state.currentEquipment.id === updatedEquipment.id) {
        state.currentEquipment = updatedEquipment;
      }
    },
    REMOVE_EQUIPMENT(state, id) {
      state.equipmentList = state.equipmentList.filter(item => item.id !== id);
      if (state.currentEquipment && state.currentEquipment.id === id) {
        state.currentEquipment = null;
      }
    },

    // Категории
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

    // Статусы
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

    // Общие
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    // Получение списка оборудования
    async fetchEquipment({ commit }, params = {}) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/equipment', { params });
        commit('SET_EQUIPMENT', response.data.data);
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
        commit('SET_ERROR', error.message || 'Ошибка при получении оборудования');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Создание оборудования
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

    // Загрузка изображения оборудования
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

    // Категории оборудования
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

    // Статусы оборудования
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
    }
  },
  getters: {
    // Оборудование
    allEquipment: state => state.equipmentList,
    equipmentById: state => id => state.equipmentList.find(item => item.id === id),
    currentEquipment: state => state.currentEquipment,

    // Категории
    allCategories: state => state.categories,
    categoryById: state => id => state.categories.find(category => category.id === id),

    // Статусы
    allStatuses: state => state.statuses,
    statusById: state => id => state.statuses.find(status => status.id === id),

    // Оборудование по категории
    equipmentByCategory: state => categoryId => {
      return state.equipmentList.filter(item => item.categoryId === categoryId);
    },

    // Оборудование по статусу
    equipmentByStatus: state => statusId => {
      return state.equipmentList.filter(item => item.statusId === statusId);
    },

    // Оборудование по пользователю
    equipmentByUser: state => userId => {
      return state.equipmentList.filter(item => item.assignedToId === userId);
    },

    // Общие
    isLoading: state => state.loading,
    error: state => state.error
  }
};
