import Vue from 'vue';
import Vuex from 'vuex';

import auth from './modules/auth';
import equipment from './modules/equipment';
import requests from './modules/requests';
import users from './modules/users';
import notification from './modules/notification';
import dashboard from '@/store/modules/dashboard';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    dashboard,
    auth,
    equipment,
    requests,
    users,
    notification
  }
});