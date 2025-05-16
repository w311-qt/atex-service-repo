<template>
  <div class="dashboard">
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

    <!-- Информационные карточки -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark>
          <v-card-text class="py-4">
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
          <v-card-text class="py-4">
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
          <v-card-text class="py-4">
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
          <v-card-text class="py-4">
            <div class="text-h4 font-weight-bold">{{ stats.needAttention }}</div>
            <div>Требует внимания</div>
            <v-icon class="position-absolute opacity-6 bottom-0 end-0 mb-4 me-4" size="56">
              mdi-alert
            </v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Графики -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card outlined height="390px">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left>mdi-chart-donut</v-icon>
            Распределение оборудования по категориям
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="loading" class="text-center mt-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="!stats.categoryStats || stats.categoryStats.length === 0" class="text-center py-3 mt-8">
              <v-icon large color="grey lighten-1">mdi-chart-donut</v-icon>
              <p class="mt-2 grey--text">Нет данных для отображения</p>
            </div>
            <canvas v-else ref="categoryChart" class="chart-canvas"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined height="390px">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left>mdi-chart-donut</v-icon>
            Распределение оборудования по статусам
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="loading" class="text-center mt-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="!stats.statusStats || stats.statusStats.length === 0" class="text-center py-3 mt-8">
              <v-icon large color="grey lighten-1">mdi-chart-donut</v-icon>
              <p class="mt-2 grey--text">Нет данных для отображения</p>
            </div>
            <canvas v-else ref="statusChart" class="chart-canvas"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Последние заявки и активности -->
    <v-row class="mt-4">
      <v-col cols="12" md="7">
        <v-card outlined class="mb-2">
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
                  @click="viewRequest(item.id)"
                >
                  {{ item.number }}
                </v-btn>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  small
                  :color="getStatusColor(item.status)"
                  text-color="white"
                >
                  {{ item.status?.name || item.status || 'Не указан' }}
                </v-chip>
              </template>

              <template v-slot:item.createdAt="{ item }">
                {{ formatDateTime(item.createdAt) }}
              </template>

              <template v-slot:no-data>
                <div class="text-center py-3">
                  <v-icon large color="grey lighten-1">mdi-clipboard-text-off</v-icon>
                  <p class="mt-2 grey--text">Нет последних заявок</p>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card outlined class="mb-2">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left>mdi-history</v-icon>
            Последние действия
          </v-card-title>
          <v-card-text class="pa-3">
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

              <v-timeline-item
                v-if="recentActivities.length === 0 && !loading"
                color="grey"
                small
              >
                <div class="font-weight-normal">
                  <strong>Нет активностей</strong>
                  <div>Пока нет записей об активностях</div>
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

    <!-- Оборудование, требующее внимания -->
    <v-row class="mt-2 mb-4">
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
                  {{ item.status?.name || item.status || 'Не указан' }}
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
                  :to="{ path: '/requests/create', query: { equipmentId: item.id } }"
                >
                  <v-icon small>mdi-clipboard-plus</v-icon>
                </v-btn>
              </template>

              <template v-slot:no-data>
                <div class="text-center py-3">
                  <v-icon large color="grey lighten-1">mdi-desktop-classic-off</v-icon>
                  <p class="mt-2 grey--text">Нет оборудования, требующего внимания</p>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { mapGetters } from 'vuex';

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
        needAttention: 0,
        categoryStats: [],
        statusStats: []
      },
      recentRequests: [],
      recentActivities: [],
      attentionEquipment: [],
      categoryChart: null,
      statusChart: null,
      requestHeaders: [
        { text: '№ заявки', value: 'number' },
        { text: 'Тема', value: 'title' },
        { text: 'Статус', value: 'status' },
        { text: 'Создана', value: 'createdAt' }
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
    ]),
  },
  created() {
    this.fetchDashboardData();
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);

    // Таймаут для начальной отрисовки после загрузки компонента
    setTimeout(() => {
      if (this.stats.categoryStats && this.stats.categoryStats.length > 0 &&
        this.stats.statusStats && this.stats.statusStats.length > 0) {
        this.renderCharts();
      }
    }, 1000);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);

    // Уничтожаем графики при уничтожении компонента
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.statusChart) {
      this.statusChart.destroy();
    }
  },
  methods: {
    viewRequest(id) {
      this.$router.push(`/requests/${id}`);
    },

    handleResize() {
      // Перерисовываем графики при изменении размера окна
      if (this.categoryChart || this.statusChart) {
        this.renderCharts();
      }
    },

    async fetchDashboardData() {
      this.loading = true;
      try {
        // Инициализируем пустые значения для статистики
        this.stats = {
          equipmentTotal: 0,
          activeRequests: 0,
          workingEquipment: 0,
          needAttention: 0,
          categoryStats: [],
          statusStats: []
        };

        // Предварительно загрузим все необходимые данные в хранилище
        try {
          await Promise.all([
            // Убедимся, что данные оборудования загружены
            this.$store.dispatch('equipment/fetchEquipment'),
            // Убедимся, что данные категорий загружены
            this.$store.dispatch('equipment/fetchCategories'),
            // Убедимся, что данные статусов загружены
            this.$store.dispatch('equipment/fetchStatuses')
          ]);
        } catch (error) {
          console.error('Ошибка при предварительной загрузке данных:', error);
        }

        // Загружаем статистику
        try {
          const statsResponse = await this.$store.dispatch('dashboard/fetchStatistics');

          // Устанавливаем данные из API (если они есть)
          if (statsResponse && Object.keys(statsResponse).length > 0) {
            this.stats = statsResponse;
            console.log('Загружена статистика из API:', this.stats);
          } else {
            console.warn('API вернуло пустые данные для статистики');
          }
        } catch (error) {
          console.error('Ошибка при загрузке статистики:', error);
        }

        // Загружаем последние заявки
        try {
          const requestsResponse = await this.$store.dispatch('dashboard/fetchRecentRequests');
          this.recentRequests = requestsResponse || [];
        } catch (error) {
          console.error('Ошибка при загрузке последних заявок:', error);
          this.recentRequests = [];
        }

        // Загружаем последние активности
        try {
          const activitiesResponse = await this.$store.dispatch('dashboard/fetchRecentActivities');
          this.recentActivities = activitiesResponse || [];
        } catch (error) {
          console.error('Ошибка при загрузке последних активностей:', error);
          this.recentActivities = [];
        }

        // Загружаем оборудование, требующее внимания
        try {
          const attentionResponse = await this.$store.dispatch('dashboard/fetchAttentionEquipment');
          this.attentionEquipment = attentionResponse || [];
        } catch (error) {
          console.error('Ошибка при загрузке оборудования:', error);
          this.attentionEquipment = [];
        }

        // Рендерим графики после загрузки данных
        this.$nextTick(() => {
          this.renderCharts();
        });
      } catch (error) {
        console.error('Ошибка при загрузке данных для дашборда:', error);
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке данных для обзорной панели');
        // Устанавливаем пустые значения по умолчанию
        this.stats = {
          equipmentTotal: 0,
          activeRequests: 0,
          workingEquipment: 0,
          needAttention: 0,
          categoryStats: [],
          statusStats: []
        };
        this.recentRequests = [];
        this.recentActivities = [];
        this.attentionEquipment = [];
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      this.refreshing = true;

      try {
        // Сначала обновим данные в хранилище
        await Promise.all([
          this.$store.dispatch('equipment/fetchEquipment'),
          this.$store.dispatch('requests/fetchRequests'),
          this.$store.dispatch('equipment/fetchCategories'),
          this.$store.dispatch('equipment/fetchStatuses')
        ]);

        // Затем загрузим данные для дашборда
        await this.fetchDashboardData();

        // Рендерим графики после обновления данных
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderCharts();
          }, 300);
        });

        this.$store.commit('notification/SHOW_SUCCESS', 'Данные успешно обновлены');
      } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при обновлении данных');
      } finally {
        this.refreshing = false;
      }
    },

    renderCharts() {
      console.log('Запуск отрисовки графиков с данными:', {
        categoryStats: this.stats.categoryStats ? this.stats.categoryStats.length : 0,
        statusStats: this.stats.statusStats ? this.stats.statusStats.length : 0
      });

      if (this.categoryChart) {
        console.log('Уничтожение существующего графика категорий');
        this.categoryChart.destroy();
        this.categoryChart = null;
      }

      if (this.statusChart) {
        console.log('Уничтожение существующего графика статусов');
        this.statusChart.destroy();
        this.statusChart = null;
      }

      // Используем nextTick для гарантии обновления DOM
      this.$nextTick(() => {
        // Отрисовываем график категорий
        if (this.$refs.categoryChart && this.stats.categoryStats && this.stats.categoryStats.length > 0) {
          console.log('Создание нового графика категорий с данными:', this.stats.categoryStats);
          this.renderCategoryChart();
        } else {
          console.warn('Невозможно отрисовать график категорий: DOM-элемент не найден или нет данных');
        }

        // Отрисовываем график статусов
        if (this.$refs.statusChart && this.stats.statusStats && this.stats.statusStats.length > 0) {
          console.log('Создание нового графика статусов с данными:', this.stats.statusStats);
          this.renderStatusChart();
        } else {
          console.warn('Невозможно отрисовать график статусов: DOM-элемент не найден или нет данных');
        }
      });
    },


    renderCategoryChart() {
      if (!this.$refs.categoryChart) {
        console.log('Элемент categoryChart не найден');
        return;
      }

      // Проверяем наличие данных для графика
      if (!this.stats.categoryStats || this.stats.categoryStats.length === 0) {
        console.log('Нет данных для категорий, график не будет отображен');
        return;
      }

      // Уничтожаем предыдущий экземпляр графика, если он существует
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }

      try {
        const ctx = this.$refs.categoryChart.getContext('2d');
        if (!ctx) {
          console.log('Не удалось получить контекст для canvas');
          return;
        }

        const categoryData = this.stats.categoryStats || [];
        console.log('Данные для категорий:', categoryData);

        const labels = categoryData.map(item => item.category);
        const data = categoryData.map(item => item.count);

        // Более привлекательные цвета для категорий
        const colors = [
          '#6b509a', // Оперативная память (фиолетовый)
          '#3660bd', // HDD накопители (зеленый)
          '#0b18e8', // SSD накопители (голубой)
          '#003453', // UPS (желтый)
          '#495c85', // Блоки питания (красный)
          '#8E24AA'  // Материнские платы (фиолетовый)
        ];

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
                  boxWidth: 10,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });

        console.log('График категорий создан успешно');
      } catch (error) {
        console.error('Ошибка при рендеринге графика категорий:', error);
      }
    },

    renderStatusChart() {
      if (!this.$refs.statusChart) {
        console.log('Элемент statusChart не найден');
        return;
      }

      // Проверяем наличие данных для графика
      if (!this.stats.statusStats || this.stats.statusStats.length === 0) {
        console.log('Нет данных для статусов, график не будет отображен');
        return;
      }

      // Уничтожаем предыдущий экземпляр графика, если он существует
      if (this.statusChart) {
        this.statusChart.destroy();
      }

      try {
        const ctx = this.$refs.statusChart.getContext('2d');
        if (!ctx) {
          console.log('Не удалось получить контекст для canvas');
          return;
        }

        const statusData = this.stats.statusStats || [];
        console.log('Данные для статусов:', statusData);

        const labels = statusData.map(item => item.status);
        const data = statusData.map(item => item.count);

        // Настраиваем цвета в соответствии с названиями статусов
        const colors = statusData.map(item => {
          const statusName = item.status.toLowerCase();
          if (statusName.includes('рабоч')) return '#002278'; // Синий для "Рабочий"
          if (statusName.includes('нов')) return '#2196F3'; // Голубой для "Новый"
          if (statusName.includes('дефект')) return '#607D8B'; // Серый для "Дефектный"
          if (statusName.includes('нерабоч')) return '#421111'; // Темный серый для "Нерабочий"
          return '#9E9E9E'; // По умолчанию серый
        });

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
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });

        console.log('График статусов создан успешно');
      } catch (error) {
        console.error('Ошибка при рендеринге графика статусов:', error);
      }
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

      // Проверяем, что status - это объект с полем name
      if (typeof status === 'object' && status.name) {
        const colorMap = {
          'Новая': 'info',
          'В работе': 'primary',
          'Ожидает': 'warning',
          'Выполнена': 'success',
          'Отменена': 'error'
        };

        return colorMap[status.name] || status.color || 'grey';
      }

      // Если status - это строка, используем её напрямую
      else if (typeof status === 'string') {
        const colorMap = {
          'Новая': 'info',
          'В работе': 'primary',
          'Ожидает': 'warning',
          'Выполнена': 'success',
          'Отменена': 'error'
        };

        return colorMap[status] || 'grey';
      }

      return 'grey';
    },

    getEquipmentStatusColor(status) {
      if (!status) return 'grey';

      // Проверяем, что status - это объект с полем name
      if (typeof status === 'object' && status.name) {
        const colorMap = {
          'Новый': 'info',
          'Рабочий': 'success',
          'Дефектный': 'warning',
          'Нерабочий': 'error'
        };

        return colorMap[status.name] || status.color || 'grey';
      }

      // Если status - это строка, используем её напрямую
      else if (typeof status === 'string') {
        const colorMap = {
          'Новый': 'info',
          'Рабочий': 'success',
          'Дефектный': 'warning',
          'Нерабочий': 'error'
        };

        return colorMap[status] || 'grey';
      }

      return 'grey';
    },

    getActivityColor(type) {
      const typeColors = {
        'create': 'green',
        'update': 'blue',
        'statusChange': 'orange',
        'comment': 'purple',
        'assign': 'indigo',
        'complete': 'green',
        'cancel': 'red'
      };

      return typeColors[type] || 'grey';
    },

    getActivityTitle(activity) {
      const typeTitles = {
        'create': 'Создание заявки',
        'update': 'Обновление заявки',
        'statusChange': 'Изменение статуса',
        'comment': 'Комментарий',
        'assign': 'Назначение исполнителя',
        'complete': 'Завершение заявки',
        'cancel': 'Отмена заявки'
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

<style>
.dashboard {
  width: 100%;
  background-color: var(--background-color);
  padding-bottom: 24px;
}

@media (max-width: 600px) {
  .v-card__title {
    font-size: 1rem !important;
    padding: 12px 16px !important;
  }

  .v-card__text {
    padding: 12px 16px !important;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .chart-canvas {
    height: 240px !important;
    max-height: 240px !important;
    margin-top: 0 !important;
  }
}
</style>