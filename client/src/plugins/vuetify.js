import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import ru from 'vuetify/lib/locale/ru';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      },
    },
  },
  icons: {
    iconfont: 'mdi',
  },
  lang: {
    locales: { ru },
    current: 'ru',
  },
});