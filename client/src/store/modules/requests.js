import api from '@/services/api';

const state = {
  requestsList: [],
  totalRequests: 0,
  currentRequest: null,
  requestTypes: [],
  requestStatuses: [],
  requestPriorities: [],
  requestActivities: [],
  loading: false,
  error: null
};

const getters = {
  allRequests: state => state.requestsList,
  requestById: state => id => state.requestsList.find(item => item.id === id),
  totalRequests: state => state.totalRequests,
  currentRequest: state => state.currentRequest,

  allRequestTypes: state => state.requestTypes,
  requestTypeById: state => id => state.requestTypes.find(type => type.id === id),

  allRequestStatuses: state => state.requestStatuses,
  requestStatusById: state => id => state.requestStatuses.find(status => status.id === id),

  allRequestPriorities: state => state.requestPriorities,
  requestPriorityById: state => id => state.requestPriorities.find(priority => priority.id === id),

  requestActivities: state => state.requestActivities,

  loading: state => state.loading,
  error: state => state.error
};

const actions = {
  async fetchRequests({ commit }, params = {}) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get('/requests', { params });
      commit('SET_REQUESTS_LIST', response.data.data);
      commit('SET_TOTAL_REQUESTS', response.data.total);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении списка заявок');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchRequestById({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get(`/requests/${id}`);
      commit('SET_CURRENT_REQUEST', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении данных заявки');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

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

  async deleteRequest({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      await api.delete(`/requests/${id}`);
      commit('REMOVE_REQUEST', id);
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при удалении заявки');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

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
      commit('SET_ERROR', error.message || 'Ошибка при назначении исполнителя');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

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

  async fetchRequestActivities({ commit }, id) {
    commit('SET_LOADING', true);

    try {
      const response = await api.get(`/requests/${id}/activities`);
      commit('SET_REQUEST_ACTIVITIES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при получении активностей заявки');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

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
  },

  resetCurrentRequest({ commit }) {
    commit('SET_CURRENT_REQUEST', null);
  }
};

const mutations = {
  SET_REQUESTS_LIST(state, requestsList) {
    state.requestsList = requestsList;
  },

  SET_TOTAL_REQUESTS(state, total) {
    state.totalRequests = total;
  },

  SET_CURRENT_REQUEST(state, request) {
    state.currentRequest = request;
  },

  ADD_REQUEST(state, request) {
    state.requestsList.push(request);
    state.totalRequests++;
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
    state.totalRequests--;

    if (state.currentRequest && state.currentRequest.id === id) {
      state.currentRequest = null;
    }
  },

  SET_REQUEST_TYPES(state, types) {
    state.requestTypes = types;
  },

  SET_REQUEST_STATUSES(state, statuses) {
    state.requestStatuses = statuses;
  },

  SET_REQUEST_PRIORITIES(state, priorities) {
    state.requestPriorities = priorities;
  },

  SET_REQUEST_ACTIVITIES(state, activities) {
    state.requestActivities = activities;
  },

  ADD_REQUEST_ACTIVITY(state, activity) {
    state.requestActivities.unshift(activity);
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