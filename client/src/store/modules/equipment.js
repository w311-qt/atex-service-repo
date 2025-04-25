import axios from 'axios';

const state = {
  equipment: [],
  categories: [],
  statuses: [],
  currentEquipment: null,
  loading: false,
  error: null,
  totalItems: 0
};

const getters = {
  allEquipment: state => state.equipment,
  allCategories: state => state.categories,
  allStatuses: state => state.statuses,
  currentEquipment: state => state.currentEquipment,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error,
  totalItems: state => state.totalItems
};

// Мутации
const mutations = {
  SET_EQUIPMENT(state, equipment) {
    state.equipment = equipment;
  },
  SET_TOTAL_ITEMS(state, total) {
    state.totalItems = total;
  },
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },
  SET_STATUSES(state, statuses) {
    state.statuses = statuses;
  },
  SET_CURRENT_EQUIPMENT(state, equipment) {
    state.currentEquipment = equipment;
  },
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  ADD_EQUIPMENT(state, equipment) {
    state.equipment.push(equipment);
  },
  UPDATE_EQUIPMENT(state, updatedEquipment) {
    const index = state.equipment.findIndex(item => item.id === updatedEquipment.id);
    if (index !== -1) {
      state.equipment.splice(index, 1, updatedEquipment);
    }
  },
  REMOVE_EQUIPMENT(state, id) {
    state.equipment = state.equipment.filter(item => item.id !== id);
  }
};

// Действия
const actions = {
  // Загрузка списка оборудования с пагинацией и фильтрацией
  async fetchEquipment({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.get('/equipment', { params });
      commit('SET_EQUIPMENT', response.data.data);
      commit('SET_TOTAL_ITEMS', response.data.total);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Загрузка категорий оборудования
  async fetchCategories({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await axios.get('/equipment/categories');
      commit('SET_CATEGORIES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке категорий');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Загрузка статусов оборудования
  async fetchStatuses({ commit }) {
    commit('SET_LOADING', true);

    try {
      const response = await axios.get('/equipment/statuses');
      commit('SET_STATUSES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке статусов');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Получение информации о конкретном оборудовании
  async fetchEquipmentById({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.get(`/equipment/${id}`);
      commit('SET_CURRENT_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Создание нового оборудования
  async createEquipment({ commit }, equipmentData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.post('/equipment', equipmentData);
      commit('ADD_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при создании оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Обновление существующего оборудования
  async updateEquipment({ commit }, { id, data }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.patch(`/equipment/${id}`, data);
      commit('UPDATE_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при обновлении оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Удаление оборудования
  async deleteEquipment({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      await axios.delete(`/equipment/${id}`);
      commit('REMOVE_EQUIPMENT', id);
      return true;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при удалении оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Загрузка изображения для оборудования
  async uploadEquipmentImage({ commit }, { id, formData }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.post(`/equipment/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при загрузке изображения');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Назначение оборудования пользователю
  async assignEquipment({ commit }, { id, userId }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const response = await axios.post(`/equipment/${id}/assign`, { userId });
      commit('UPDATE_EQUIPMENT', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка при назначении оборудования');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
