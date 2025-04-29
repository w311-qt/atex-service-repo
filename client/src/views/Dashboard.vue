<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Обзорная панель</h1>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="refreshData"
          :loading="refreshing"
        >
          <v-icon left>mdi-refresh</v-icon>
          Обновить
        </v-btn>
      </v-card-title>
    </v-card>

    <v-row>
      <!-- Статистические карточки -->
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ stats.equipmentTotal }}</div>
            <div>Единиц оборудования</div>
            <v-icon class="position-absolute opacity-6 bottom-0 end-0 mb-4 me-4" size="56">
              mdi-desktop-classic
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ stats.activeRequests }}</div>
            <div>Активных заявок</div>
            <v-icon class="position-absolute opacity-6 bottom-0 end-0 mb-4 me-4" size="56">
              mdi-clipboard-text
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ stats.workingEquipment }}</div>
            <div>Рабочее оборудование</div>
            <v-icon class="position-absolute opacity-6 bottom-0 end-0 mb-4 me-4" size="56">
              mdi-check-circle
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ stats.needAttention }}</div>
            <div>Требует внимания</div>
            <v-icon class="position-absolute opacity-6 bottom-0 end-0 mb-4 me-4" size="56">
              mdi-alert
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Графики и аналитика -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card outlined height="100%">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left>mdi-chart-donut</v-icon>
            Распределение оборудования по категориям
          </v-card-title>
          <v-card-text class="pa-4">
            <canvas ref="categoryChart"></canvas>
            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined height="100%">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left>mdi-chart-donut</v-icon>
            Распределение оборудования по статусам
          </v-card-title>
          <v-card-text class="pa-4">
            <canvas ref="statusChart"></canvas>
            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="7">
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4 d-flex align-center">
            <div>
              <v-icon left>mdi-clipboard-text</v-icon>
              Последние заявки
            </div>
            <v-spacer></v-spacer>
            <v-btn
              text
              color="primary"
              small
              :to="{ name: 'RequestList' }"
            >
              Все заявки
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table
              :headers="requestHeaders"
              :items="recentRequests"
              :loading="loading"
              hide-default-footer
              disable-pagination
              disable-sort
              class="requests-table"
            >
              <template v-slot:item.number="{ item }">
                <v-btn
                  text
                  color="primary"
                  small
                  :to="{ name: 'RequestDetails', params: { id: item.id } }"
                >
                  {{ item.number }}
                </v-btn>
              </template>

              <template v-slot:item.status.name="{ item }">
                <v-chip
                  small
                  :color="getStatusColor(item.status)"
                  text-color="white"
                >
                  {{ item.status ? item.status.name : 'Не указан' }}
                </v-chip>
              </template>

              <template v-slot:item.createdAt="{ item }">
                {{ formatDateTime(item.createdAt) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left>mdi-history</v-icon>
            Последние действия
          </v-card-title>
          <v-card-text class="pa-0">
            <v-timeline dense class="pt-0">
              <v-timeline-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                :color="getActivityColor(activity.type)"
                small
              >
                <div class="font-weight-normal">
                  <strong>{{ getActivityTitle(activity) }}</strong>
                  <div>{{ activity.message }}</div>
                  <div>
                    <span class="caption grey--text">
                      {{ formatDateTime(activity.timestamp) }}
                    </span>
                    <span class="caption grey--text ml-2">
                      {{ activity.user ? activity.user.name : 'Система' }}
                    </span>
                  </div>
                </div>
              </v-timeline-item>

              <template v-if="loading">
                <v-timeline-item
                  color="grey"
                  small
                >
                  <v-skeleton-loader type="text" width="250"></v-skeleton-loader>
                </v-timeline-item>
                <v-timeline-item
                  color="grey"
                  small
                >
                  <v-skeleton-loader type="text" width="200"></v-skeleton-loader>
                </v-timeline-item>
              </template>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4 d-flex align-center">
            <div>
              <v-icon left>mdi-desktop-classic</v-icon>
              Оборудование, требующее внимания
            </div>
            <v-spacer></v-spacer>
            <v-btn
              text
              color="primary"
              small
              :to="{ name: 'EquipmentList' }"
            >
              Все оборудование
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table
              :headers="equipmentHeaders"
              :items="attentionEquipment"
              :loading="loading"
              hide-default-footer
              disable-pagination
              disable-sort
              class="equipment-table"
            >
              <template v-slot:item.name="{ item }">
                <v-btn
                  text
                  color="primary"
                  small
                  :to="{ name: 'EquipmentDetails', params: { id: item.id } }"
                >
                  {{ item.name }}
                </v-btn>
              </template>

              <template v-slot:item.status.name="{ item }">
                <v-chip
                  small
                  :color="getEquipmentStatusColor(item.status)"
                  text-color="white"
                >
                  {{ item.status ? item.status.name : 'Не указан' }}
                </v-chip>
              </template>

              <template v-slot:item.category.name="{ item }">
                {{ item.category ? item.category.name : 'Не указана' }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  text
                  small
                  color="primary"
                  class="mr-1"
                  :to="{ name: 'EquipmentDetails', params: { id: item.id } }"
                >
                  <v-icon small>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  text
                  small
                  color="success"
                  class="mr-1"
                  :to="{ name: 'RequestCreate', query: { equipmentId: item.id } }"
                >
                  <v-icon small>mdi-clipboard-plus</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Chart from 'chart.js/auto';

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      refreshing: false,
      stats: {
        equipmentTotal: 0,
        activeRequests: 0,
        workingEquipment: 0,
        needAttention: 0
      },
      recentRequests: [],
      recentActivities: [],
      attentionEquipment: [],
      categoryChart: null,
      statusChart: null,
      requestHeaders: [
        { text: 'Номер', value: 'number', width: '100px' },
        { text: 'Название', value: 'title' },
        { text: 'Статус', value: 'status.name', width: '150px' },
        { text: 'Создана', value: 'createdAt', width: '150px' }
      ],
      equipmentHeaders: [
        { text: 'Наименование', value: 'name' },
        { text: 'Инв. номер', value: 'inventoryNumber', width: '150px' },
        { text: 'Категория', value: 'category.name', width: '150px' },
        { text: 'Статус', value: 'status.name', width: '150px' },
        { text: 'Действия', value: 'actions', width: '100px', sortable: false, align: 'center' }
      ]
    };
  },
  computed: {
    ...mapGetters('auth', [
      'currentUser',
      'isAdmin',
      'isTechnician'
    ]),
    ...mapGetters('equipment', [
      'allCategories',
      'allStatuses'
    ])
  },
  created() {
    this.fetchDashboardData();
  },
  mounted() {
    this.renderCharts();
  },
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        // Получаем общую статистику
        const statsResponse = await this.$store.dispatch('dashboard/fetchStatistics');
        this.stats = statsResponse;

        // Получаем последние заявки
        const requestsResponse = await this.$store.dispatch('dashboard/fetchRecentRequests');
        this.recentRequests = requestsResponse;

        // Получаем последние активности
        const activitiesResponse = await this.$store.dispatch('dashboard/fetchRecentActivities');
        this.recentActivities = activitiesResponse;

        // Получаем оборудование, требующее внимания
        const attentionResponse = await this.$store.dispatch('dashboard/fetchAttentionEquipment');
        this.attentionEquipment = attentionResponse;

        // Загружаем справочники, если их еще нет
        if (this.allCategories.length === 0) {
          await this.$store.dispatch('equipment/fetchCategories');
        }
        if (this.allStatuses.length === 0) {
          await this.$store.dispatch('equipment/fetchStatuses');
        }

        // Обновляем графики после получения данных
        this.$nextTick(() => {
          this.renderCharts();
        });
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке данных для дашборда');
        console.error('Dashboard data loading error:', error);
      } finally {
        this.loading = false;
      }
    },

    refreshData() {
      this.refreshing = true;
      this.fetchDashboardData().finally(() => {
        this.refreshing = false;
      });
    },

    renderCharts() {
      this.renderCategoryChart();
      this.renderStatusChart();
    },

    renderCategoryChart() {
      if (!this.$refs.categoryChart) return;

      // Уничтожаем предыдущий экземпляр графика, если он существует
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }

      const ctx = this.$refs.categoryChart.getContext('2d');

      // Формируем данные для графика из статистики
      const categoryData = this.stats.categoryStats || [];
      const labels = categoryData.map(item => item.category);
      const data = categoryData.map(item => item.count);
      const colors = this.generateChartColors(data.length);

      this.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
                boxWidth: 10
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },

    renderStatusChart() {
      if (!this.$refs.statusChart) return;

      // Уничтожаем предыдущий экземпляр графика, если он существует
      if (this.statusChart) {
        this.statusChart.destroy();
      }

      const ctx = this.$refs.statusChart.getContext('2d');

      // Формируем данные для графика из статистики
      const statusData = this.stats.statusStats || [];
      const labels = statusData.map(item => item.status);
      const data = statusData.map(item => item.count);
      const colors = this.getStatusColors(labels);

      this.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
                boxWidth: 10
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },

    formatDateTime(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    getStatusColor(status) {
      if (!status) return 'grey';

      const colorMap = {
        'Новая': 'info',
        'В работе': 'primary',
        'Ожидает': 'warning',
        'Выполнена': 'success',
        'Отменена': 'error'
      };

      return colorMap[status.name] || status.color || 'grey';
    },

    getEquipmentStatusColor(status) {
      if (!status) return 'grey';

      const colorMap = {
        'Новый': 'info',
        'Рабочий': 'success',
        'Дефектный': 'warning',
        'Нерабочий': 'error'
      };

      return colorMap[status.name] || status.color || 'grey';
    },

    getActivityColor(type) {
      const typeColors = {
        create: 'green',
        update: 'blue',
        statusChange: 'orange',
        comment: 'purple',
        assign: 'indigo',
        complete: 'green',
        cancel: 'red'
      };

      return typeColors[type] || 'grey';
    },

    getActivityTitle(activity) {
      const typeTitles = {
        create: 'Создание заявки',
        update: 'Обновление заявки',
        statusChange: 'Изменение статуса',
        comment: 'Комментарий',
        assign: 'Назначение исполнителя',
        complete: 'Завершение заявки',
        cancel: 'Отмена заявки'
      };

      return typeTitles[activity.type] || 'Действие';
    },

    generateChartColors(count) {
      const colors = [
        '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0',
        '#3F51B5', '#009688', '#795548', '#607D8B', '#E91E63'
      ];

      if (count <= colors.length) {
        return colors.slice(0, count);
      }

      // Если нужно больше цветов, генерируем их случайным образом
      const result = [...colors];
      for (let i = colors.length; i < count; i++) {
        const r = Math.floor(Math.random() * 200) + 20;
        const g = Math.floor(Math.random() * 200) + 20;
        const b = Math.floor(Math.random() * 200) + 20;
        result.push(`rgb(${r}, ${g}, ${b})`);
      }

      return result;
    },

    getStatusColors(statusNames) {
      const statusColorMap = {
        'Новый': '#2196F3',
        'Рабочий': '#4CAF50',
        'Дефектный': '#FFC107',
        'Нерабочий': '#F44336',
        'Новая': '#2196F3',
        'В работе': '#FF9800',
        'Ожидает': '#FFC107',
        'Выполнена': '#4CAF50',
        'Отменена': '#F44336'
      };

      return statusNames.map(name => statusColorMap[name] || '#607D8B');
    }
  }
};
</script>

<style scoped>
.position-absolute {
  position: absolute;
}

.bottom-0 {
  bottom: 0;
}

.end-0 {
  right: 0;
}

.mb-4 {
  margin-bottom: 1rem;
}

.me-4 {
  margin-right: 1rem;
}

.opacity-6 {
  opacity: 0.6;
}

.requests-table, .equipment-table {
  /* Убираем внешние отступы таблицы для лучшего внешнего вида */
  margin: 0 !important;
  width: 100%;
}

/* Установка высоты для контейнера графика */
canvas {
  height: 250px !important;
}
</style>