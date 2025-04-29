import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import apiClient from './plugins/axios';
import moment from 'moment';
import 'moment/locale/ru';

// Устанавливаем русскую локаль для moment
moment.locale('ru');

// Отключаем сообщения с советами в консоли для production
Vue.config.productionTip = process.env.NODE_ENV === 'production';

// Регистрируем axios в качестве глобального свойства
Vue.prototype.$axios = apiClient;

// Глобальные фильтры
Vue.filter('formatDate', function(value) {
  if (!value) return '';
  return moment(value).format('DD.MM.YYYY');
});

Vue.filter('formatDateTime', function(value) {
  if (!value) return '';
  return moment(value).format('DD.MM.YYYY HH:mm');
});

// Глобальные миксины, если они нужны
Vue.mixin({
  methods: {
    // Проверка доступности действий для разных ролей
    canView(item) {
      const user = store.getters['auth/currentUser'];
      if (!user) return false;

      // Администратор может просматривать всё
      if (user.role === 'admin') return true;

      // Техник может просматривать определенные вещи
      if (user.role === 'technician') {
        // Логика для техников...
        return true;
      }

      // Обычный пользователь может просматривать только свои вещи
      if (item.createdBy && item.createdBy.id === user.id) return true;

      return false;
    },
    canEdit(item) {
      const user = store.getters['auth/currentUser'];
      if (!user) return false;

      // Администратор может редактировать всё
      if (user.role === 'admin') return true;

      // Техник может редактировать определенные вещи
      if (user.role === 'technician') {
        // Логика для техников...
        return true;
      }

      // Обычный пользователь может редактировать только свои вещи и только в определенных статусах
      if (item.createdBy && item.createdBy.id === user.id) {
        // Дополнительные проверки по статусу...
        return true;
      }

      return false;
    }
  }
});

// Инициализация приложения
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),

  // Хук mounted - выполняется после монтирования корневого компонента
  async mounted() {
    // Проверяем авторизацию при запуске приложения
    if (store.getters['auth/isAuthenticated']) {
      try {
        await store.dispatch('auth/checkAuth');
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      }
    }
  }
}).$mount('#app');