import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';

// Layouts
import MainLayout from '@/layouts/MainLayout.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';

// Views
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import EquipmentList from '@/views/equipment/EquipmentList.vue';
import EquipmentDetails from '@/views/equipment/EquipmentDetails.vue';
import CategoryList from '@/views/equipment/CategoryList.vue';
import StatusList from '@/views/equipment/StatusList.vue';
import RequestList from '@/views/requests/RequestList.vue';
import RequestDetails from '@/views/requests/RequestDetails.vue';
import Profile from '@/views/Profile.vue';
import Settings from '@/views/Settings.vue';
import Reports from '@/views/Reports.vue';
import Users from '@/views/Users.vue';
import NotFound from '@/views/NotFound.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      layout: BlankLayout,
      requiresAuth: false
    }
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
        component: CategoryList
      },
      {
        path: 'equipment/statuses',
        name: 'StatusList',
        component: StatusList
      },
      {
        path: 'requests',
        name: 'RequestList',
        component: RequestList
      },
      {
        path: 'requests/:id',
        name: 'RequestDetails',
        component: RequestDetails,
        props: true
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
        path: 'reports',
        name: 'Reports',
        component: Reports
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { requiresAdmin: true }
      }
    ]
  },
  {
    path: '*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// Навигационный guard для проверки авторизации
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  const isAdmin = store.getters['auth/isAdmin'];

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresAdmin && !isAdmin) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;