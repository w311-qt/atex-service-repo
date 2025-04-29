<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Категории оборудования</h1>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="createCategory"
        >
          <v-icon left>mdi-plus</v-icon>
          Добавить категорию
        </v-btn>
      </v-card-title>
    </v-card>

    <v-row>
      <!-- Список категорий -->
      <v-col cols="12" md="8">
        <v-card outlined>
          <v-data-table
            :headers="headers"
            :items="categories"
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
                @click="editCategory(item)"
                class="mr-2"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                color="error"
                @click="deleteCategory(item)"
                :disabled="item.equipmentCount > 0"
              >
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </template>

            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <template v-slot:no-data>
              <div class="text-center py-3">
                <v-icon large color="grey lighten-1">mdi-tag-off</v-icon>
                <p class="mt-2 grey--text">Нет категорий</p>
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
              <span>Всего категорий:</span>
              <span class="font-weight-bold">{{ categories.length }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Категории с оборудованием:</span>
              <span class="font-weight-bold">{{ categoriesWithEquipment }}</span>
            </div>
            <div class="d-flex justify-space-between">
              <span>Пустые категории:</span>
              <span class="font-weight-bold">{{ categories.length - categoriesWithEquipment }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- График распределения оборудования по категориям -->
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-chart-donut</v-icon>
            Распределение оборудования
          </v-card-title>
          <v-card-text class="pa-4">
            <canvas ref="categoryChart" height="250"></canvas>
            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="categories.length === 0" class="text-center py-3">
              <v-icon large color="grey lighten-1">mdi-chart-donut</v-icon>
              <p class="mt-2 grey--text">Нет данных для отображения</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания/редактирования категории -->
    <v-dialog
      v-model="dialog"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditing ? 'Редактирование категории' : 'Создание категории' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="formData.name"
              :rules="nameRules"
              label="Название категории*"
              required
            ></v-text-field>
            <v-textarea
              v-model="formData.description"
              label="Описание"
              rows="3"
              auto-grow
            ></v-textarea>
          </v-form>
          <small>*обязательное поле</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Отмена</v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveCategory"
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
          <span class="headline">Удаление категории</span>
        </v-card-title>
        <v-card-text>
          Вы действительно хотите удалить категорию <strong>{{ selectedCategory ? selectedCategory.name : '' }}</strong>?
          <div class="mt-2">
            <v-alert
              v-if="selectedCategory && selectedCategory.equipmentCount > 0"
              type="error"
              text=""
              dense
            >
              Невозможно удалить категорию, так как к ней привязано {{ selectedCategory.equipmentCount }} единиц оборудования.
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
            :disabled="selectedCategory && selectedCategory.equipmentCount > 0 || deleteLoading"
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
  name: 'CategoryList',
  data() {
    return {
      loading: false,
      search: '',
      categories: [],
      headers: [
        { text: 'Название', value: 'name', sortable: true },
        { text: 'Описание', value: 'description', sortable: false },
        { text: 'Оборудование', value: 'equipmentCount', sortable: true, align: 'center', width: '150px' },
        { text: 'Создана', value: 'createdAt', sortable: true, width: '150px' },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '120px' }
      ],
      dialog: false,
      isEditing: false,
      valid: true,
      saveLoading: false,
      formData: {
        name: '',
        description: ''
      },
      nameRules: [
        v => !!v || 'Название категории обязательно',
        v => (v && v.length >= 2) || 'Название должно содержать минимум 2 символа'
      ],
      deleteDialog: false,
      deleteLoading: false,
      selectedCategory: null,
      categoryChart: null
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isAdmin'
    ]),
    categoriesWithEquipment() {
      return this.categories.filter(category => category.equipmentCount > 0).length;
    }
  },
  created() {
    this.fetchCategories();
  },
  mounted() {
    this.$nextTick(() => {
      this.renderChart();
    });
  },
  methods: {
    async fetchCategories() {
      this.loading = true;
      try {
        const response = await this.$store.dispatch('equipment/fetchCategoriesWithCount');
        this.categories = response;
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке категорий');
      } finally {
        this.loading = false;
      }
    },

    renderChart() {
      if (!this.$refs.categoryChart || this.categories.length === 0) return;

      // Уничтожаем предыдущий экземпляр графика, если он существует
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }

      const ctx = this.$refs.categoryChart.getContext('2d');

      // Формируем данные для графика
      const nonEmptyCategories = this.categories.filter(cat => cat.equipmentCount > 0);
      const labels = nonEmptyCategories.map(cat => cat.name);
      const data = nonEmptyCategories.map(cat => cat.equipmentCount);
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

    formatDate(dateString) {
      if (!dateString) return '-';

      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },

    createCategory() {
      this.isEditing = false;
      this.formData = {
        name: '',
        description: ''
      };
      this.dialog = true;
    },

    editCategory(category) {
      this.isEditing = true;
      this.selectedCategory = category;
      this.formData = {
        id: category.id,
        name: category.name,
        description: category.description || ''
      };
      this.dialog = true;
    },

    async saveCategory() {
      if (!this.$refs.form.validate()) return;

      this.saveLoading = true;

      try {
        if (this.isEditing) {
          // Обновление категории
          await this.$store.dispatch('equipment/updateCategory', {
            id: this.formData.id,
            categoryData: {
              name: this.formData.name,
              description: this.formData.description
            }
          });
          this.$store.commit('notification/SHOW_SUCCESS', 'Категория успешно обновлена');
        } else {
          // Создание категории
          await this.$store.dispatch('equipment/createCategory', this.formData);
          this.$store.commit('notification/SHOW_SUCCESS', 'Категория успешно создана');
        }

        this.closeDialog();
        this.fetchCategories();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка при сохранении категории';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.saveLoading = false;
      }
    },

    closeDialog() {
      this.dialog = false;
      this.selectedCategory = null;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    deleteCategory(category) {
      this.selectedCategory = category;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedCategory) return;
      if (this.selectedCategory.equipmentCount > 0) return;

      this.deleteLoading = true;

      try {
        await this.$store.dispatch('equipment/deleteCategory', this.selectedCategory.id);
        this.$store.commit('notification/SHOW_SUCCESS', 'Категория успешно удалена');
        this.deleteDialog = false;
        this.fetchCategories();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка при удалении категории';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.deleteLoading = false;
      }
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
    }
  }
};
</script>

<style scoped>
.v-card__title {
  word-break: normal;
}
</style>