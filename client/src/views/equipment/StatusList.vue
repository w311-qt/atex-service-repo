<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Статусы оборудования</h1>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="createStatus"
        >
          <v-icon left>mdi-plus</v-icon>
          Добавить статус
        </v-btn>
      </v-card-title>
    </v-card>

    <v-row>
      <!-- Список статусов -->
      <v-col cols="12" md="8">
        <v-card outlined>
          <v-data-table
            :headers="headers"
            :items="statuses"
            :loading="loading"
            :search="search"
            item-key="id"
            class="elevation-0"
          >
            <template v-slot:top>
              <v-card-title>
                <v-text-field
                  v-model="search"
                  prepend-icon="mdi-magnify"
                  label="Поиск"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
            </template>

            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar
                  size="10"
                  :color="item.color || '#808080'"
                  class="mr-2"
                ></v-avatar>
                {{ item.name }}
              </div>
            </template>

            <template v-slot:item.color="{ item }">
              <v-chip
                small
                :color="item.color || '#808080'"
                text-color="white"
              >
                {{ item.color || '#808080' }}
              </v-chip>
            </template>

            <template v-slot:item.equipmentCount="{ item }">
              <v-chip
                small
                color="primary"
                outlined
              >
                {{ item.equipmentCount }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                small
                color="primary"
                @click="editStatus(item)"
                class="mr-2"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                color="error"
                @click="deleteStatus(item)"
                :disabled="item.equipmentCount > 0"
              >
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </template>

            <template v-slot:no-data>
              <div class="text-center py-3">
                <v-icon large color="grey lighten-1">mdi-tag-off</v-icon>
                <p class="mt-2 grey--text">Нет статусов</p>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Карточка со статистикой -->
      <v-col cols="12" md="4">
        <v-card outlined class="mb-4">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-chart-pie</v-icon>
            Статистика
          </v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span>Всего статусов:</span>
              <span class="font-weight-bold">{{ statuses.length }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Используются в оборудовании:</span>
              <span class="font-weight-bold">{{ statusesWithEquipment }}</span>
            </div>
            <div class="d-flex justify-space-between">
              <span>Не используются:</span>
              <span class="font-weight-bold">{{ statuses.length - statusesWithEquipment }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- График распределения оборудования по статусам -->
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-chart-donut</v-icon>
            Распределение оборудования
          </v-card-title>
          <v-card-text class="pa-4">
            <canvas ref="statusChart" height="250"></canvas>
            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="statuses.length === 0" class="text-center py-3">
              <v-icon large color="grey lighten-1">mdi-chart-donut</v-icon>
              <p class="mt-2 grey--text">Нет данных для отображения</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания/редактирования статуса -->
    <v-dialog
      v-model="dialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditing ? 'Редактирование статуса' : 'Создание статуса' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="formData.name"
              :rules="nameRules"
              label="Название статуса*"
              required
            ></v-text-field>
            <v-textarea
              v-model="formData.description"
              label="Описание"
              rows="3"
              auto-grow
            ></v-textarea>
            <v-color-picker
              v-model="formData.color"
              hide-inputs
              hide-canvas
              show-swatches
              swatches-max-height="200px"
              class="mb-3"
            ></v-color-picker>
          </v-form>
          <small>*обязательное поле</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Отмена</v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveStatus"
            :disabled="!valid || saveLoading"
            :loading="saveLoading"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog
      v-model="deleteDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Удаление статуса</span>
        </v-card-title>
        <v-card-text>
          Вы действительно хотите удалить статус <strong>{{ selectedStatus ? selectedStatus.name : '' }}</strong>?
          <div class="mt-2">
            <v-alert
              v-if="selectedStatus && selectedStatus.equipmentCount > 0"
              type="error"
              text=""
              dense
            >
              Невозможно удалить статус, так как он используется для {{ selectedStatus.equipmentCount }} единиц оборудования.
            </v-alert>
            <v-alert
              v-else
              type="warning"
              text=""
              dense
            >
              Это действие нельзя отменить.
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn
            color="red darken-1"
            text
            @click="confirmDelete"
            :disabled="selectedStatus && selectedStatus.equipmentCount > 0 || deleteLoading"
            :loading="deleteLoading"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Chart from 'chart.js/auto';

export default {
  name: 'StatusList',
  data() {
    return {
      loading: false,
      search: '',
      statuses: [],
      headers: [
        { text: 'Название', value: 'name', sortable: true },
        { text: 'Описание', value: 'description', sortable: false },
        { text: 'Цвет', value: 'color', sortable: true, width: '150px' },
        { text: 'Оборудование', value: 'equipmentCount', sortable: true, align: 'center', width: '150px' },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '120px' }
      ],
      dialog: false,
      isEditing: false,
      valid: true,
      saveLoading: false,
      formData: {
        name: '',
        description: '',
        color: '#2196F3' // Цвет по умолчанию
      },
      nameRules: [
        v => !!v || 'Название статуса обязательно',
        v => (v && v.length >= 2) || 'Название должно содержать минимум 2 символа'
      ],
      deleteDialog: false,
      deleteLoading: false,
      selectedStatus: null,
      statusChart: null
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isAdmin'
    ]),
    statusesWithEquipment() {
      return this.statuses.filter(status => status.equipmentCount > 0).length;
    }
  },
  created() {
    this.fetchStatuses();
  },
  mounted() {
    this.$nextTick(() => {
      this.renderChart();
    });
  },
  methods: {
    async fetchStatuses() {
      this.loading = true;
      try {
        const response = await this.$store.dispatch('equipment/fetchStatusesWithCount');
        this.statuses = response;
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке статусов');
      } finally {
        this.loading = false;
      }
    },

    renderChart() {
      if (!this.$refs.statusChart || this.statuses.length === 0) return;

      // Уничтожаем предыдущий экземпляр графика, если он существует
      if (this.statusChart) {
        this.statusChart.destroy();
      }

      const ctx = this.$refs.statusChart.getContext('2d');

      // Формируем данные для графика
      const nonEmptyStatuses = this.statuses.filter(stat => stat.equipmentCount > 0);
      const labels = nonEmptyStatuses.map(stat => stat.name);
      const data = nonEmptyStatuses.map(stat => stat.equipmentCount);
      const colors = nonEmptyStatuses.map(stat => stat.color || '#808080');

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
              position: 'bottom',
              labels: {
                padding: 15,
                boxWidth: 10,
                font: {
                  size: 10
                }
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

    createStatus() {
      this.isEditing = false;
      this.formData = {
        name: '',
        description: '',
        color: '#2196F3' // Цвет по умолчанию
      };
      this.dialog = true;
    },

    editStatus(status) {
      this.isEditing = true;
      this.selectedStatus = status;
      this.formData = {
        id: status.id,
        name: status.name,
        description: status.description || '',
        color: status.color || '#2196F3'
      };
      this.dialog = true;
    },

    async saveStatus() {
      if (!this.$refs.form.validate()) return;

      this.saveLoading = true;

      try {
        if (this.isEditing) {
          // Обновление статуса
          await this.$store.dispatch('equipment/updateStatus', {
            id: this.formData.id,
            statusData: {
              name: this.formData.name,
              description: this.formData.description,
              color: this.formData.color
            }
          });
          this.$store.commit('notification/SHOW_SUCCESS', 'Статус успешно обновлен');
        } else {
          // Создание статуса
          await this.$store.dispatch('equipment/createStatus', this.formData);
          this.$store.commit('notification/SHOW_SUCCESS', 'Статус успешно создан');
        }

        this.closeDialog();
        this.fetchStatuses();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка при сохранении статуса';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.saveLoading = false;
      }
    },

    closeDialog() {
      this.dialog = false;
      this.selectedStatus = null;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    deleteStatus(status) {
      this.selectedStatus = status;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedStatus) return;
      if (this.selectedStatus.equipmentCount > 0) return;

      this.deleteLoading = true;

      try {
        await this.$store.dispatch('equipment/deleteStatus', this.selectedStatus.id);
        this.$store.commit('notification/SHOW_SUCCESS', 'Статус успешно удален');
        this.deleteDialog = false;
        this.fetchStatuses();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка при удалении статуса';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.deleteLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.v-card__title {
  word-break: normal;
}
</style>
