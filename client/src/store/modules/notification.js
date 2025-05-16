const state = {
  notifications: [],
  nextId: 1
};

const getters = {
  getNotifications: state => state.notifications
};

const actions = {
  showNotification({ commit }, { type, message, timeout = 5000 }) {
    const id = Date.now();

    commit('ADD_NOTIFICATION', {
      id,
      type,
      message,
      timeout
    });

    return id;
  },

  showSuccess({ dispatch }, message) {
    return dispatch('showNotification', {
      type: 'success',
      message,
      timeout: 5000
    });
  },

  showError({ dispatch }, message) {
    return dispatch('showNotification', {
      type: 'error',
      message,
      timeout: 8000
    });
  },

  showWarning({ dispatch }, message) {
    return dispatch('showNotification', {
      type: 'warning',
      message,
      timeout: 7000
    });
  },

  showInfo({ dispatch }, message) {
    return dispatch('showNotification', {
      type: 'info',
      message,
      timeout: 5000
    });
  },

  removeNotification({ commit }, id) {
    commit('REMOVE_NOTIFICATION', id);
  },

  clearNotifications({ commit }) {
    commit('CLEAR_NOTIFICATIONS');
  }
};

const mutations = {
  ADD_NOTIFICATION(state, notification) {
    state.notifications.push({
      ...notification,
      id: state.nextId++
    });

    if (notification.timeout > 0) {
      setTimeout(() => {
        const index = state.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          state.notifications.splice(index, 1);
        }
      }, notification.timeout);
    }
  },

  REMOVE_NOTIFICATION(state, id) {
    const index = state.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      state.notifications.splice(index, 1);
    }
  },

  CLEAR_NOTIFICATIONS(state) {
    state.notifications = [];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};