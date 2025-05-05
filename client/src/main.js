import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ru';

// Установка русской локали
moment.locale('ru');

// Отключение предупреждений для production
Vue.config.productionTip = process.env.NODE_ENV === 'production';

// Axios по умолчанию
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';
Vue.prototype.$axios = axios;

// Глобальные фильтры
Vue.filter('formatDate', function(value) {
  if (!value) return '';
  return moment(value).format('DD.MM.YYYY');
});

Vue.filter('formatDateTime', function(value) {
  if (!value) return '';
  return moment(value).format('DD.MM.YYYY HH:mm');
});

// Глобальные миксины для проверки прав
Vue.mixin({
  methods: {
    canManageEquipment() {
      return this.$store.getters['auth/isAdmin'] || this.$store.getters['auth/isTechnician'];
    },
    canManageRequests() {
      return this.$store.getters['auth/isAdmin'] || this.$store.getters['auth/isTechnician'];
    },
    isCurrentUser(userId) {
      const currentUser = this.$store.getters['auth/currentUser'];
      return currentUser && currentUser.id === userId;
    }
  }
});

// Инициализация приложения
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),

  // Проверка авторизации при запуске
  async created() {
    // Проверка аутентификации при загрузке приложения
    if (store.getters['auth/isAuthenticated']) {
      try {
        await store.dispatch('auth/checkAuth');
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      }
    }
  }
}).$mount('#app');