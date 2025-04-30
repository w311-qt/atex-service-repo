// client/src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

// Импорт модулей
import auth from './modules/auth';
import equipment from './modules/equipment';
import requests from './modules/requests';
import users from './modules/users';
import notification from './modules/notification';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    equipment,
    requests,
    users,
    notification
  }
});