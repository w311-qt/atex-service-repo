import Vue from 'vue';
import Vuex from 'vuex';

import auth from './auth';
import equipment from './modules/equipment';
import requests from './modules/requests';
import notification from '../store/notification'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    appLoading: false
  },
  mutations: {
    SET_APP_LOADING(state, status) {
      state.appLoading = status;
    }
  },
  actions: {
    setAppLoading({ commit }, status) {
      commit('SET_APP_LOADING', status);
    }
  },
  getters: {
    isAppLoading: state => state.appLoading
  },
  modules: {
    auth,
    equipment,
    requests,
    notification
  }
});