// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    // Просто выводим ошибку в консоль
    console.error('API error:', error.response?.status, error.response?.data);
    // Не перенаправляем на логин
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('Ошибка API:', error.response?.status, error.response?.data);

    // Если получен 401, значит токен недействителен или истек
    if (error.response && error.response.status === 401) {
      console.log('Получена ошибка 401, выходим из системы');
      // Очищаем localStorage и состояние авторизации
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Импортируем store и вызываем мутацию
      import('@/store').then(({ default: store }) => {
        store.commit('auth/CLEAR_AUTH_DATA');
        // Перенаправление на страницу входа
        import('@/router').then(({ default: router }) => {
          if (router.currentRoute.path !== '/login') {
            router.push('/login');
          }
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;