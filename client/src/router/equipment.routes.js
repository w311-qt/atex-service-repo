// Маршруты для модуля оборудования
export default [
  {
    path: '/equipment',
    name: 'equipment',
    component: () => import('@/views/equipment/EquipmentList.vue'),
    meta: {
      title: 'Оборудование',
      requiresAuth: true
    }
  },
  {
    path: '/equipment/add',
    name: 'equipment-add',
    component: () => import('@/views/equipment/EquipmentForm.vue'),
    meta: {
      title: 'Добавление оборудования',
      requiresAuth: true
    }
  },
  {
    path: '/equipment/:id',
    name: 'equipment-details',
    component: () => import('@/views/equipment/EquipmentDetails.vue'),
    props: true,
    meta: {
      title: 'Информация об оборудовании',
      requiresAuth: true
    }
  },
  {
    path: '/equipment/:id/edit',
    name: 'equipment-edit',
    component: () => import('@/views/equipment/EquipmentForm.vue'),
    props: route => ({
      id: route.params.id,
      isEditing: true
    }),
    meta: {
      title: 'Редактирование оборудования',
      requiresAuth: true
    }
  },
  // Роуты для справочников
  {
    path: '/equipment/categories',
    name: 'equipment-categories',
    component: () => import('@/views/equipment/CategoryList.vue'),
    meta: {
      title: 'Категории оборудования',
      requiresAuth: true,
      adminOnly: true
    }
  },
  {
    path: '/equipment/statuses',
    name: 'equipment-statuses',
    component: () => import('@/views/equipment/StatusList.vue'),
    meta: {
      title: 'Статусы оборудования',
      requiresAuth: true,
      adminOnly: true
    }
  }
];