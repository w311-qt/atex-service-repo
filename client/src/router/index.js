import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Layouts
import MainLayout from '@/layouts/MainLayout.vue';

// Views
import Login from '@/views/Login.vue';
import RequestListView from '@/views/RequestListView.vue';
import EquipmentList from '@/views/equipment/EquipmentList.vue';
import EquipmentDetails from '@/views/equipment/EquipmentDetails.vue';

// Lazy-loaded views
const Dashboard = () => import('@/views/Dashboard.vue');
const Categories = () => import('@/views/Categories.vue');
const Users = () => import('@/views/Users.vue');
const Reports = () => import('@/views/Reports.vue');
const Profile = () => import('@/views/Profile.vue');
const Settings = () => import('@/views/Settings.vue');
const NotFound = () => import('@/views/NotFound.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      layout: 'blank'
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
        path: 'requests',
        name: 'RequestList',
        component: RequestListView
      },
      {
        path: 'categories',
        name: 'Categories',
        component: Categories
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { requiresAdmin: true }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: Reports
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // Проверка аутентификации
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // Проверка прав администратора
  if (requiresAdmin && authStore.user?.role !== 'admin') {
    next({ name: 'Dashboard' });
    return;
  }

  next();
});

export default router;