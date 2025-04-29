// src/store/modules/requests.js
import api from '@/services/api';

export default {
  namespaced: true,
  state: {
    requestsList: [],
    requestTypes: [],
    requestStatuses: [],
    requestPriorities: [],
    currentRequest: null,
    requestActivities: [],
    loading: false,
    error: null
  },
  mutations: {
    // Заявки
    SET_REQUESTS(state, requests) {
      state.requestsList = requests;
    },
    SET_CURRENT_REQUEST(state, request) {
      state.currentRequest = request;
    },
    ADD_REQUEST(state, request) {
      state.requestsList.push(request);
    },
    UPDATE_REQUEST(state, updatedRequest) {
      const index = state.requestsList.findIndex(item => item.id === updatedRequest.id);
      if (index !== -1) {
        state.requestsList.splice(index, 1, updatedRequest);
      }
      if (state.currentRequest && state.currentRequest.id === updatedRequest.id) {
        state.currentRequest = updatedRequest;
      }
    },
    REMOVE_REQUEST(state, id) {
      state.requestsList = state.requestsList.filter(item => item.id !== id);
      if (state.currentRequest && state.currentRequest.id === id) {
        state.currentRequest = null;
      }
    },

    // Типы заявок
    SET_REQUEST_TYPES(state, types) {
      state.requestTypes = types;
    },

    // Статусы заявок
    SET_REQUEST_STATUSES(state, statuses) {
      state.requestStatuses = statuses;
    },

    // Приоритеты заявок
    SET_REQUEST_PRIORITIES(state, priorities) {
      state.requestPriorities = priorities;
    },

    // Активности заявок
    SET_REQUEST_ACTIVITIES(state, activities) {
      state.requestActivities = activities;
    },
    ADD_REQUEST_ACTIVITY(state, activity) {
      state.requestActivities.unshift(activity);
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
    // Получение списка заявок
    async fetchRequests({ commit }, params = {}) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/requests', { params });
        commit('SET_REQUESTS', response.data.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при получении списка заявок');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Получение заявки по ID
    async fetchRequestById({ commit }, id) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get(`/requests/${id}`);
        commit('SET_CURRENT_REQUEST', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при получении заявки');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Создание заявки
    async createRequest({ commit }, requestData) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/requests', requestData);
        commit('ADD_REQUEST', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при создании заявки');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Обновление заявки
    async updateRequest({ commit }, { id, requestData }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.patch(`/requests/${id}`, requestData);
        commit('UPDATE_REQUEST', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при обновлении заявки');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Изменение статуса заявки
    async changeRequestStatus({ commit }, { id, statusId, comment }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/requests/${id}/status`, {
          statusId,
          comment
        });
        commit('UPDATE_REQUEST', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при изменении статуса заявки');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Назначение заявки техническому специалисту
    async assignRequest({ commit }, { id, userId, comment }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/requests/${id}/assign`, {
          userId,
          comment
        });
        commit('UPDATE_REQUEST', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при назначении заявки');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Добавление комментария к заявке
    async addRequestComment({ commit }, { id, comment }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/requests/${id}/comment`, { comment });
        commit('ADD_REQUEST_ACTIVITY', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при добавлении комментария');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Завершение заявки
    async completeRequest({ commit }, { id, resolutionComment }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/requests/${id}/complete`, {
          resolutionComment
        });
        commit('UPDATE_REQUEST', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при завершении заявки');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Отмена заявки
    async cancelRequest({ commit }, { id, reason }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post(`/requests/${id}/cancel`, { reason });
        commit('UPDATE_REQUEST', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при отмене заявки');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Получение истории активностей по заявке
    async fetchRequestActivities({ commit }, id) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get(`/requests/${id}/activities`);
        commit('SET_REQUEST_ACTIVITIES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при получении истории заявки');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Получение типов заявок
    async fetchRequestTypes({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/request-types');
        commit('SET_REQUEST_TYPES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при получении типов заявок');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Получение статусов заявок
    async fetchRequestStatuses({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/request-statuses');
        commit('SET_REQUEST_STATUSES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при получении статусов заявок');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Получение приоритетов заявок
    async fetchRequestPriorities({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/request-priorities');
        commit('SET_REQUEST_PRIORITIES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Ошибка при получении приоритетов заявок');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    // Заявки
    allRequests: state => state.requestsList,
    requestById: state => id => state.requestsList.find(item => item.id === id),
    currentRequest: state => state.currentRequest,

    // Фильтры заявок
    requestsByType: state => typeId => {
      return state.requestsList.filter(item => item.typeId === typeId);
    },
    requestsByStatus: state => statusId => {
      return state.requestsList.filter(item => item.statusId === statusId);
    },
    requestsByPriority: state => priorityId => {
      return state.requestsList.filter(item => item.priorityId === priorityId);
    },
    requestsByUser: state => userId => {
      return state.requestsList.filter(item => item.createdById === userId);
    },
    requestsAssignedToUser: state => userId => {
      return state.requestsList.filter(item => item.assignedToId === userId);
    },

    // Справочники
    allRequestTypes: state => state.requestTypes,
    requestTypeById: state => id => state.requestTypes.find(type => type.id === id),

    allRequestStatuses: state => state.requestStatuses,
    requestStatusById: state => id => state.requestStatuses.find(status => status.id === id),

    allRequestPriorities: state => state.requestPriorities,
    requestPriorityById: state => id => state.requestPriorities.find(priority => priority.id === id),

    // Активности
    requestActivities: state => state.requestActivities,

    // Общие
    isLoading: state => state.loading,
    error: state => state.error
  }
};