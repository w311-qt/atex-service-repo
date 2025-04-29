<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Обзорная панель</h1>
      </v-card-title>
    </v-card>

    <v-row>
      <!-- Статистические карточки -->
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ totalEquipment }}</div>
            <div>Единиц оборудования</div>
            <v-icon size="large" class="position-absolute opacity-25 bottom-0 end-0 mb-4 me-4">
              mdi-desktop-classic
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ totalRequests }}</div>
            <div>Активных заявок</div>
            <v-icon size="large" class="position-absolute opacity-25 bottom-0 end-0 mb-4 me-4">
              mdi-clipboard-text
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ workingEquipment }}</div>
            <div>Рабочее оборудование</div>
            <v-icon size="large" class="position-absolute opacity-25 bottom-0 end-0 mb-4 me-4">
              mdi-check-circle
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ defectiveEquipment }}</div>
            <div>Требует внимания</div>
            <v-icon size="large" class="position-absolute opacity-25 bottom-0 end-0 mb-4 me-4">
              mdi-alert
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- Последние активности -->
      <v-col cols="12" md="6">
        <v-card outlined height="100%">
          <v-card-title>
            <v-icon left>mdi-history</v-icon>
            Последние активности
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-list-item v-for="(activity, index) in recentActivities" :key="index">
                <v-list-item-avatar>
                  <v-icon :color="getActivityColor(activity.type)">
                    {{ getActivityIcon(activity.type) }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ activity.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ activity.time }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Последние заявки -->
      <v-col cols="12" md="6">
        <v-card outlined height="100%">
          <v-card-title>
            <v-icon left>mdi-clipboard-text</v-icon>
            Последние заявки
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-list-item v-for="(request, index) in recentRequests" :key="index">
                <v-list-item-content>
                  <v-list-item-title>{{ request.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ request.createdAt }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip :color="getStatusColor(request.status)" small>
                    {{ request.status }}
                  </v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      // Данные для демонстрации
      totalEquipment: 124,
      totalRequests: 15,
      workingEquipment: 98,
      defectiveEquipment: 12,

      recentActivities: [
        { type: 'create', title: 'Добавлен новый монитор Dell P2419H', time: '10 минут назад' },
        { type: 'update', title: 'Обновлен статус заявки #REQ-2023-0023', time: '30 минут назад' },
        { type: 'assign', title: 'Назначен ответственный за оборудование', time: '1 час назад' },
        { type: 'complete', title: 'Выполнена заявка #REQ-2023-0015', time: '2 часа назад' },
      ],

      recentRequests: [
        { title: 'Замена блока питания', status: 'Новая', createdAt: '10 минут назад' },
        { title: 'Настройка монитора', status: 'В работе', createdAt: '2 часа назад' },
        { title: 'Заправка картриджа', status: 'Ожидает', createdAt: '3 часа назад' },
        { title: 'Перемещение оборудования', status: 'Выполнена', createdAt: '5 часов назад' },
      ]
    }
  },
  methods: {
    getActivityIcon(type) {
      const icons = {
        create: 'mdi-plus-circle',
        update: 'mdi-pencil',
        assign: 'mdi-account-arrow-right',
        complete: 'mdi-check-circle',
        cancel: 'mdi-close-circle'
      }
      return icons[type] || 'mdi-information'
    },

    getActivityColor(type) {
      const colors = {
        create: 'green',
        update: 'blue',
        assign: 'purple',
        complete: 'success',
        cancel: 'error'
      }
      return colors[type] || 'grey'
    },

    getStatusColor(status) {
      const colors = {
        'Новая': 'info',
        'В работе': 'primary',
        'Ожидает': 'warning',
        'Выполнена': 'success',
        'Отменена': 'error'
      }
      return colors[status] || 'grey'
    }
  }
}
</script>