// client/src/router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';

// Layouts
import MainLayout from '@/layouts/MainLayout.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';

// Views
import Login from '@/views/Login.vue';
import NotFound from '@/views/NotFound.vue';
import Dashboard from '@/views/Dashboard.vue';
import Profile from '@/views/Profile.vue';
import Settings from '@/views/Settings.vue';
import Users from '@/views/Users.vue';

// Equipment views
import EquipmentList from '@/views/equipment/EquipmentList.vue';
import EquipmentDetails from '@/views/equipment/EquipmentDetails.vue';
import CategoryList from '@/views/equipment/CategoryList.vue';
import StatusList from '@/views/equipment/StatusList.vue';

// Request views
import RequestList from '@/views/RequestListView.vue';
//import RequestDetails from '@/views/requests/RequestDetails.vue';
import Reports from '@/views/Reports.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false }
      }
    ]
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { requiresAdmin: true }
      },

      // Equipment routes
      {
        path: 'equipment',
        name: 'EquipmentList',
        component: EquipmentList
      },
      {
        path: 'equipment/:id',
        name: 'EquipmentDetails',
        component: EquipmentDetails,
        props: true
      },
      {
        path: 'equipment/categories',
        name: 'CategoryList',
        component: CategoryList,
        meta: { requiresAdmin: true }
      },
      {
        path: 'equipment/statuses',
        name: 'StatusList',
        component: StatusList,
        meta: { requiresAdmin: true }
      },

      // Request routes
      {
        path: 'requests',
        name: 'RequestList',
        component: RequestList
      },

      {
        path: 'reports',
        name: 'Reports',
        component: Reports
      }
    ]
  },
  {
    // 404 page
    path: '*',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'NotFound',
        component: NotFound
      }
    ]
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// Navigation guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // Проверяем аутентификацию только для маршрутов, требующих авторизации
  if (requiresAuth) {
    const isAuthenticated = store.getters['auth/isAuthenticated'];

    if (!isAuthenticated) {
      // Если пользователь не аутентифицирован, перенаправляем на страницу входа
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }

    // Проверяем права администратора для маршрутов, требующих прав администратора
    if (requiresAdmin && !store.getters['auth/isAdmin']) {
      // Если пользователь не администратор, перенаправляем на дашборд
      return next({ path: '/' });
    }
  }

  // Если пользователь аутентифицирован и пытается открыть страницу логина,
  // перенаправляем на дашборд
  if (to.path === '/login' && store.getters['auth/isAuthenticated']) {
    return next({ path: '/' });
  }

  next();
});

export default router;