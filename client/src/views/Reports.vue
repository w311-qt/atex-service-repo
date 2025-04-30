<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Отчеты и аналитика</h1>
      </v-card-title>
    </v-card>

    <v-row>
      <v-col cols="12" md="3">
        <v-card outlined class="mb-4">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-file-chart</v-icon>
            Параметры отчета
          </v-card-title>
          <v-card-text class="pa-4">
            <v-select
              v-model="selectedReportType"
              :items="reportTypes"
              label="Тип отчета"
              @change="resetParams"
            ></v-select>

            <v-divider class="my-4"></v-divider>

            <div v-if="selectedReportType === 'equipment'">
              <v-select
                v-model="equipmentParams.categoryIds"
                :items="categories"
                item-text="name"
                item-value="id"
                label="Категории"
                multiple
                chips
                small-chips
              ></v-select>

              <v-select
                v-model="equipmentParams.statusIds"
                :items="statuses"
                item-text="name"
                item-value="id"
                label="Статусы"
                multiple
                chips
                small-chips
              ></v-select>

              <v-menu
                ref="fromDateMenu"
                v-model="fromDateMenu"
                :close-on-content-click="false"
                :return-value.sync="equipmentParams.dateFrom"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="equipmentParams.dateFrom"
                    label="Дата поступления от"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="equipmentParams.dateFrom"
                  no-title
                  scrollable
                  @input="fromDateMenu = false"
                ></v-date-picker>
              </v-menu>

              <v-menu
                ref="toDateMenu"
                v-model="toDateMenu"
                :close-on-content-click="false"
                :return-value.sync="equipmentParams.dateTo"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="equipmentParams.dateTo"
                    label="Дата поступления до"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="equipmentParams.dateTo"
                  no-title
                  scrollable
                  @input="toDateMenu = false"
                ></v-date-picker>
              </v-menu>
            </div>

            <!-- Параметры для отчета по заявкам -->
            <div v-if="selectedReportType === 'requests'">
              <v-select
                v-model="requestParams.statusIds"
                :items="requestStatuses"
                item-text="name"
                item-value="id"
                label="Статусы заявок"
                multiple
                chips
                small-chips
              ></v-select>

              <v-select
                v-model="requestParams.typeIds"
                :items="requestTypes"
                item-text="name"
                item-value="id"
                label="Типы заявок"
                multiple
                chips
                small-chips
              ></v-select>

              <v-select
                v-model="requestParams.assignedToIds"
                :items="technicians"
                item-text="name"
                item-value="id"
                label="Исполнители"
                multiple
                chips
                small-chips
              ></v-select>

              <v-menu
                ref="requestFromDateMenu"
                v-model="requestFromDateMenu"
                :close-on-content-click="false"
                :return-value.sync="requestParams.dateFrom"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="requestParams.dateFrom"
                    label="Дата создания от"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="requestParams.dateFrom"
                  no-title
                  scrollable
                  @input="requestFromDateMenu = false"
                ></v-date-picker>
              </v-menu>

              <v-menu
                ref="requestToDateMenu"
                v-model="requestToDateMenu"
                :close-on-content-click="false"
                :return-value.sync="requestParams.dateTo"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="requestParams.dateTo"
                    label="Дата создания до"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="requestParams.dateTo"
                  no-title
                  scrollable
                  @input="requestToDateMenu = false"
                ></v-date-picker>
              </v-menu>
            </div>

            <v-divider class="my-4"></v-divider>

            <v-btn
              color="primary"
              block
              @click="generateReport"
              :loading="loading"
              :disabled="loading"
            >
              Сформировать отчет
            </v-btn>

            <v-btn
              color="success"
              block
              class="mt-2"
              @click="exportReport"
              :disabled="!reportData || loading"
            >
              <v-icon left>mdi-file-excel</v-icon>
              Экспорт в Excel
            </v-btn>

            <v-btn
              color="info"
              block
              class="mt-2"
              @click="printReport"
              :disabled="!reportData || loading"
            >
              <v-icon left>mdi-printer</v-icon>
              Печать
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Результаты отчета -->
      <v-col cols="12" md="9">
        <div v-if="loading" class="text-center pa-5">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <div class="mt-3">Формирование отчета...</div>
        </div>

        <div v-else-if="!reportData" class="text-center pa-5">
          <v-icon size="64" color="grey lighten-1">mdi-file-chart-outline</v-icon>
          <div class="mt-3 grey--text">Выберите тип отчета и параметры, затем нажмите "Сформировать отчет"</div>
        </div>

        <template v-else>
          <!-- Отчет по оборудованию -->
          <template v-if="selectedReportType === 'equipment'">
            <v-card outlined class="mb-4" id="report-content">
              <v-card-title class="py-2 grey lighten-4">
                <v-icon left color="primary">mdi-desktop-classic</v-icon>
                Отчет по оборудованию
                <v-spacer></v-spacer>
                <div class="text-subtitle-2">{{ formatReportDate() }}</div>
              </v-card-title>

              <v-card-text class="px-4 pt-4 pb-0">
                <h3 class="mb-3">Количество оборудования по категориям</h3>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-left">Категория</th>
                      <th class="text-right">Количество</th>
                      <th class="text-right">% от общего</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in reportData.byCategory" :key="index">
                      <td>{{ item.category }}</td>
                      <td class="text-right">{{ item.count }}</td>
                      <td class="text-right">{{ calculatePercentage(item.count, reportData.total) }}%</td>
                    </tr>
                    <tr class="font-weight-bold">
                      <td>Итого</td>
                      <td class="text-right">{{ reportData.total }}</td>
                      <td class="text-right">100%</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>

              <v-card-text class="px-4 pt-4 pb-0">
                <h3 class="mb-3">Количество оборудования по статусам</h3>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-left">Статус</th>
                      <th class="text-right">Количество</th>
                      <th class="text-right">% от общего</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in reportData.byStatus" :key="index">
                      <td>{{ item.status }}</td>
                      <td class="text-right">{{ item.count }}</td>
                      <td class="text-right">{{ calculatePercentage(item.count, reportData.total) }}%</td>
                    </tr>
                    <tr class="font-weight-bold">
                      <td>Итого</td>
                      <td class="text-right">{{ reportData.total }}</td>
                      <td class="text-right">100%</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>

              <v-card-text class="px-4 pt-4 pb-0">
                <h3 class="mb-3">Количество оборудования по возрасту</h3>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-left">Возраст</th>
                      <th class="text-right">Количество</th>
                      <th class="text-right">% от общего</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in reportData.byAge" :key="index">
                      <td>{{ item.ageGroup }}</td>
                      <td class="text-right">{{ item.count }}</td>
                      <td class="text-right">{{ calculatePercentage(item.count, reportData.total) }}%</td>
                    </tr>
                    <tr class="font-weight-bold">
                      <td>Итого</td>
                      <td class="text-right">{{ reportData.total }}</td>
                      <td class="text-right">100%</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>
            </v-card>

            <!-- Графики для отчета по оборудованию -->
            <v-row>
              <v-col cols="12" md="6">
                <v-card outlined>
                  <v-card-title class="py-2 grey lighten-4">
                    <v-icon left color="primary">mdi-chart-pie</v-icon>
                    Распределение по категориям
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <canvas ref="categoryChart"></canvas>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card outlined>
                  <v-card-title class="py-2 grey lighten-4">
                    <v-icon left color="primary">mdi-chart-donut</v-icon>
                    Распределение по статусам
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <canvas ref="statusChart"></canvas>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <!-- Отчет по заявкам -->
          <template v-if="selectedReportType === 'requests'">
            <v-card outlined class="mb-4" id="report-content">
              <v-card-title class="py-2 grey lighten-4">
                <v-icon left color="primary">mdi-clipboard-text</v-icon>
                Отчет по заявкам
                <v-spacer></v-spacer>
                <div class="text-subtitle-2">{{ formatReportDate() }}</div>
              </v-card-title>

              <v-card-text class="px-4 pt-4 pb-0">
                <h3 class="mb-3">Количество заявок по статусам</h3>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-left">Статус</th>
                      <th class="text-right">Количество</th>
                      <th class="text-right">% от общего</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in reportData.byStatus" :key="index">
                      <td>{{ item.status }}</td>
                      <td class="text-right">{{ item.count }}</td>
                      <td class="text-right">{{ calculatePercentage(item.count, reportData.total) }}%</td>
                    </tr>
                    <tr class="font-weight-bold">
                      <td>Итого</td>
                      <td class="text-right">{{ reportData.total }}</td>
                      <td class="text-right">100%</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>

              <v-card-text class="px-4 pt-4 pb-0">
                <h3 class="mb-3">Количество заявок по типам</h3>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-left">Тип</th>
                      <th class="text-right">Количество</th>
                      <th class="text-right">% от общего</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in reportData.byType" :key="index">
                      <td>{{ item.type }}</td>
                      <td class="text-right">{{ item.count }}</td>
                      <td class="text-right">{{ calculatePercentage(item.count, reportData.total) }}%</td>
                    </tr>
                    <tr class="font-weight-bold">
                      <td>Итого</td>
                      <td class="text-right">{{ reportData.total }}</td>
                      <td class="text-right">100%</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>

              <v-card-text class="px-4 pt-4 pb-0">
                <h3 class="mb-3">Заявки по техникам</h3>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-left">Техник</th>
                      <th class="text-right">Выполнено</th>
                      <th class="text-right">В работе</th>
                      <th class="text-right">Всего</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in reportData.byTechnician" :key="index">
                      <td>{{ item.technician }}</td>
                      <td class="text-right">{{ item.completed }}</td>
                      <td class="text-right">{{ item.inProgress }}</td>
                      <td class="text-right">{{ item.total }}</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>

              <v-card-text class="px-4 pt-4 pb-4">
                <h3 class="mb-3">Среднее время выполнения заявок (в часах)</h3>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-left">Тип заявки</th>
                      <th class="text-right">Среднее время</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in reportData.resolutionTime" :key="index">
                      <td>{{ item.type }}</td>
                      <td class="text-right">{{ formatHours(item.hours) }}</td>
                    </tr>
                    <tr class="font-weight-bold">
                      <td>Среднее по всем типам</td>
                      <td class="text-right">{{ formatHours(reportData.averageResolutionTime) }}</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>
            </v-card>

            <!-- Графики для отчета по заявкам -->
            <v-row>
              <v-col cols="12" md="6">
                <v-card outlined>
                  <v-card-title class="py-2 grey lighten-4">
                    <v-icon left color="primary">mdi-chart-pie</v-icon>
                    Распределение по типам
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <canvas ref="requestTypeChart"></canvas>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card outlined>
                  <v-card-title class="py-2 grey lighten-4">
                    <v-icon left color="primary">mdi-chart-timeline</v-icon>
                    Динамика создания заявок
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <canvas ref="requestTrendChart"></canvas>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Chart from 'chart.js/auto';

export default {
  name: 'Reports',
  data() {
    return {
      loading: false,
      selectedReportType: 'equipment',
      reportTypes: [
        { text: 'Отчет по оборудованию', value: 'equipment' },
        { text: 'Отчет по заявкам', value: 'requests' }
      ],
      equipmentParams: {
        categoryIds: [],
        statusIds: [],
        dateFrom: null,
        dateTo: null
      },
      requestParams: {
        statusIds: [],
        typeIds: [],
        assignedToIds: [],
        dateFrom: null,
        dateTo: null
      },
      fromDateMenu: false,
      toDateMenu: false,
      requestFromDateMenu: false,
      requestToDateMenu: false,
      reportData: null,
      charts: {
        categoryChart: null,
        statusChart: null,
        requestTypeChart: null,
        requestTrendChart: null
      }
    };
  },
  computed: {
    ...mapGetters('equipment', [
      'allCategories',
      'allStatuses'
    ]),
    ...mapGetters('requests', [
      'allRequestStatuses',
      'allRequestTypes'
    ]),
    ...mapGetters('users', [
      'allTechnicians'
    ]),
    categories() {
      return this.allCategories || [];
    },
    statuses() {
      return this.allStatuses || [];
    },
    requestStatuses() {
      return this.allRequestStatuses || [];
    },
    requestTypes() {
      return this.allRequestTypes || [];
    },
    technicians() {
      return this.allTechnicians || [];
    }
  },
  created() {
    this.loadReferenceData();
  },
  methods: {
    async loadReferenceData() {
      try {
        // Загружаем справочные данные, если их еще нет
        if (this.categories.length === 0) {
          await this.$store.dispatch('equipment/fetchCategories');
        }
        if (this.statuses.length === 0) {
          await this.$store.dispatch('equipment/fetchStatuses');
        }
        if (this.requestStatuses.length === 0) {
          await this.$store.dispatch('requests/fetchRequestStatuses');
        }
        if (this.requestTypes.length === 0) {
          await this.$store.dispatch('requests/fetchRequestTypes');
        }
        if (this.technicians.length === 0) {
          await this.$store.dispatch('users/fetchTechnicians');
        }
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке справочных данных');
      }
    },

    resetParams() {
      if (this.selectedReportType === 'equipment') {
        this.equipmentParams = {
          categoryIds: [],
          statusIds: [],
          dateFrom: null,
          dateTo: null
        };
      } else {
        this.requestParams = {
          statusIds: [],
          typeIds: [],
          assignedToIds: [],
          dateFrom: null,
          dateTo: null
        };
      }
      this.reportData = null;
      this.destroyCharts();
    },

    async generateReport() {
      this.loading = true;
      this.reportData = null;
      this.destroyCharts();

      try {
        let response;

        if (this.selectedReportType === 'equipment') {
          // Вызов API для отчета по оборудованию
          response = await this.$store.dispatch('reports/getEquipmentReport', this.equipmentParams);
        } else {
          // Вызов API для отчета по заявкам
          response = await this.$store.dispatch('reports/getRequestReport', this.requestParams);
        }

        this.reportData = response;
        this.$nextTick(() => {
          this.renderCharts();
        });
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при формировании отчета');
      } finally {
        this.loading = false;
      }
    },

    renderCharts() {
      if (!this.reportData) return;

      this.$nextTick(() => {
        if (this.selectedReportType === 'equipment') {
          this.renderEquipmentCharts();
        } else {
          this.renderRequestCharts();
        }
      });
    },

    renderEquipmentCharts() {
      // Диаграмма по категориям
      const categoryCtx = this.$refs.categoryChart?.getContext('2d');
      if (categoryCtx && this.reportData.byCategory) {
        const labels = this.reportData.byCategory.map(item => item.category);
        const data = this.reportData.byCategory.map(item => item.count);
        const colors = this.generateColors(data.length);

        this.charts.categoryChart = new Chart(categoryCtx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              },
              title: {
                display: false
              }
            }
          }
        });
      }

      // Диаграмма по статусам
      const statusCtx = this.$refs.statusChart?.getContext('2d');
      if (statusCtx && this.reportData.byStatus) {
        const labels = this.reportData.byStatus.map(item => item.status);
        const data = this.reportData.byStatus.map(item => item.count);
        const colors = this.getStatusColors(labels);

        this.charts.statusChart = new Chart(statusCtx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              },
              title: {
                display: false
              }
            }
          }
        });
      }
    },

    renderRequestCharts() {
      // Диаграмма по типам заявок
      const typeCtx = this.$refs.requestTypeChart?.getContext('2d');
      if (typeCtx && this.reportData.byType) {
        const labels = this.reportData.byType.map(item => item.type);
        const data = this.reportData.byType.map(item => item.count);
        const colors = this.generateColors(data.length);

        this.charts.requestTypeChart = new Chart(typeCtx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              },
              title: {
                display: false
              }
            }
          }
        });
      }

      // Временная диаграмма по заявкам
      const trendCtx = this.$refs.requestTrendChart?.getContext('2d');
      if (trendCtx && this.reportData.trend) {
        const labels = this.reportData.trend.map(item => item.month);
        const data = this.reportData.trend.map(item => item.count);

        this.charts.requestTrendChart = new Chart(trendCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Количество заявок',
              data: data,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: false
              }
            }
          }
        });
      }
    },

    destroyCharts() {
      Object.keys(this.charts).forEach(key => {
        if (this.charts[key]) {
          this.charts[key].destroy();
          this.charts[key] = null;
        }
      });
    },

    exportReport() {
      if (!this.reportData) return;

      try {
        let params = {};
        if (this.selectedReportType === 'equipment') {
          params = this.equipmentParams;
        } else {
          params = this.requestParams;
        }

        this.$store.dispatch('reports/exportReport', {
          type: this.selectedReportType,
          params
        }).then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${this.selectedReportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }).catch(error => {
          this.$store.commit('notification/SHOW_ERROR', 'Ошибка при экспорте отчета');
        });
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при экспорте отчета');
      }
    },

    printReport() {
      window.print();
    },

    formatReportDate() {
      return new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    calculatePercentage(value, total) {
      if (!total) return 0;
      return Math.round((value / total) * 100);
    },

    formatHours(hours) {
      if (typeof hours !== 'number') return '0 ч';
      if (hours < 1) {
        return `${Math.round(hours * 60)} мин`;
      }
      return `${Math.round(hours * 10) / 10} ч`;
    },

    generateColors(count) {
      const colors = [
        '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0',
        '#3F51B5', '#009688', '#795548', '#607D8B', '#E91E63'
      ];

      if (count <= colors.length) {
        return colors.slice(0, count);
      }

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
@media print {
  .v-app-bar,
  .v-navigation-drawer,
  .v-footer,
  .no-print {
    display: none !important;
  }

  #report-content {
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  body {
    font-size: 12pt;
  }

  h1 {
    font-size: 18pt;
  }

  h2 {
    font-size: 16pt;
  }

  h3 {
    font-size: 14pt;
  }
}
</style>
