<template>
  <div class="equipment-list">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Список оборудования
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Поиск"
                single-line
                hide-details
                @input="onSearchInput"
              ></v-text-field>
            </v-card-title>

            <v-card-text>
              <!-- Сообщение об ошибке -->
              <v-alert
                v-if="error"
                type="error"
                dismissible
                class="mb-4"
                @input="error = null"
              >
                {{ error }}
              </v-alert>

              <!-- Фильтры -->
              <v-row class="mb-4">
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="selectedCategory"
                    :items="categoriesList"
                    item-text="name"
                    item-value="id"
                    label="Категория"
                    clearable
                    :loading="categoriesLoading"
                    @change="onFilterChange"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="selectedStatus"
                    :items="statusesList"
                    item-text="name"
                    item-value="id"
                    label="Статус"
                    clearable
                    :loading="statusesLoading"
                    @change="onFilterChange"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model="inventoryNumberFilter"
                    label="Инвентарный номер"
                    clearable
                    @input="onSearchInput"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3" class="d-flex justify-end align-center">
                  <v-btn
                    color="primary"
                    class="mr-2"
                    @click="resetFilters"
                  >
                    Сбросить
                  </v-btn>
                  <v-btn
                    v-if="showAddButton"
                    color="success"
                    @click="openCreateDialog"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Добавить
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Таблица оборудования -->
              <v-data-table
                :headers="headers"
                :items="equipmentList"
                :loading="loading"
                :server-items-length="totalItems"
                :options.sync="options"
                :footer-props="{
                  'items-per-page-options': [10, 25, 50]
                }"
                @update:options="onOptionsChange"
              >
                <template v-slot:item.image="{ item }">
                  <v-avatar size="36" v-if="item.image">
                    <img :src="getImageUrl(item.image)" alt="Изображение" />
                  </v-avatar>
                  <v-icon v-else>mdi-image-off</v-icon>
                </template>

                <template v-slot:item.category.name="{ item }">
                  <v-chip small v-if="item.category">{{ item.category.name }}</v-chip>
                  <span v-else>-</span>
                </template>

                <template v-slot:item.status.name="{ item }">
                  <v-chip
                    small
                    :color="getStatusColor(item.status)"
                    text-color="white"
                    v-if="item.status"
                  >
                    {{ item.status.name }}
                  </v-chip>
                  <span v-else>-</span>
                </template>

                <template v-slot:item.assignedTo.name="{ item }">
                  {{ item.assignedTo ? item.assignedTo.name : 'Не назначено' }}
                </template>

                <template v-slot:item.purchaseDate="{ item }">
                  {{ formatDate(item.purchaseDate) }}
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-icon
                    small
                    class="mr-2"
                    @click="viewEquipment(item)"
                  >
                    mdi-eye
                  </v-icon>
                  <v-icon
                    v-if="showAddButton"
                    small
                    class="mr-2"
                    @click="editEquipment(item)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    v-if="isAdmin"
                    small
                    @click="confirmDelete(item)"
                  >
                    mdi-delete
                  </v-icon>
                </template>

                <!-- Шаблон для пустых данных -->
                <template v-slot:no-data>
                  <div class="text-center pa-5">
                    <div v-if="loading">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      <div class="caption mt-2">Загрузка данных...</div>
                    </div>
                    <div v-else>
                      <v-icon large color="grey lighten-1">mdi-database-off</v-icon>
                      <div class="subtitle-1 mt-2">Нет данных для отображения</div>
                    </div>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Диалог создания/редактирования оборудования -->
    <equipment-form-dialog
      v-if="dialog"
      :dialog="dialog"
      :editMode="editMode"
      :equipment="selectedEquipment"
      @close="closeDialog"
      @saved="onEquipmentSaved"
    />

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы действительно хотите удалить оборудование "{{ selectedEquipment ? selectedEquipment.name : '' }}"?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="red darken-1" text @click="deleteEquipment" :loading="deleteLoading">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'EquipmentList',
  components: {
    EquipmentFormDialog: () => import('@/components/equipment/EquipmentFormDialog.vue')
  },
  data() {
    return {
      search: '',
      selectedCategory: null,
      selectedStatus: null,
      inventoryNumberFilter: '',
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['name'],
        sortDesc: [false]
      },
      dialog: false,
      editMode: false,
      selectedEquipment: null,
      deleteDialog: false,
      deleteLoading: false,
      loading: false,
      categoriesLoading: false,
      statusesLoading: false,
      error: null,
      totalItems: 0,
      headers: [
        { text: 'Фото', value: 'image', sortable: false, width: '80px' },
        { text: 'Наименование', value: 'name', sortable: true },
        { text: 'Инв. номер', value: 'inventoryNumber', sortable: true },
        { text: 'Модель', value: 'model', sortable: true },
        { text: 'Категория', value: 'category.name', sortable: false },
        { text: 'Статус', value: 'status.name', sortable: false },
        { text: 'Местоположение', value: 'location', sortable: true },
        { text: 'Дата поступления', value: 'purchaseDate', sortable: true },
        { text: 'Закреплено за', value: 'assignedTo.name', sortable: false },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '100px' }
      ],
      debounceTimeout: null
    };
  },
  computed: {
    isAdmin() {
      return this.$store.getters['auth/isAdmin'];
    },
    isTechnician() {
      return this.$store.getters['auth/isTechnician'];
    },
    showAddButton() {
      return this.isAdmin || this.isTechnician;
    },
    equipmentList() {
      const list = this.$store.state.equipment?.equipmentList;
      return Array.isArray(list) ? list : [];
    },
    categoriesList() {
      const categories = this.$store.state.equipment?.categories;
      return Array.isArray(categories) ? categories : [];
    },
    statusesList() {
      const statuses = this.$store.state.equipment?.statuses;
      return Array.isArray(statuses) ? statuses : [];
    }
  },
  created() {
    this.fetchEquipment();
    this.loadCategories();
    this.loadStatuses();
  },
  methods: {
    async fetchEquipment() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.options.sortBy.length ? this.options.sortBy[0] : 'name',
          order: this.options.sortDesc.length && this.options.sortDesc[0] ? 'DESC' : 'ASC',
          search: this.search,
          categoryId: this.selectedCategory,
          statusId: this.selectedStatus,
          inventoryNumber: this.inventoryNumberFilter
        };

        const response = await this.$store.dispatch('equipment/fetchEquipment', params);

        // Handle both pagination response format and direct array
        if (response && typeof response === 'object') {
          if ('total' in response) {
            this.totalItems = response.total;
          } else if (Array.isArray(response)) {
            this.totalItems = response.length;
          }
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
        this.error = 'Failed to load equipment list';
        this.totalItems = 0;
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      // Debounce для поиска
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },

    onFilterChange() {
      this.applyFilters();
    },

    onOptionsChange() {
      this.fetchEquipment();
    },

    async loadCategories() {
      this.categoriesLoading = true;
      try {
        await this.$store.dispatch('equipment/fetchCategories');
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        this.categoriesLoading = false;
      }
    },

    async loadStatuses() {
      this.statusesLoading = true;
      try {
        await this.$store.dispatch('equipment/fetchStatuses');
      } catch (error) {
        console.error('Error loading statuses:', error);
      } finally {
        this.statusesLoading = false;
      }
    },


    applyFilters() {
      this.options.page = 1;
      this.fetchEquipment();
    },

    resetFilters() {
      this.search = '';
      this.selectedCategory = null;
      this.selectedStatus = null;
      this.inventoryNumberFilter = '';
      this.applyFilters();
    },

    openCreateDialog() {
      this.editMode = false;
      this.selectedEquipment = null;
      this.dialog = true;
    },

    viewEquipment(equipment) {
      this.$router.push({ name: 'equipment-details', params: { id: equipment.id } });
    },

    editEquipment(equipment) {
      this.editMode = true;
      this.selectedEquipment = equipment;
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      setTimeout(() => {
        this.selectedEquipment = null;
      }, 300);
    },

    onEquipmentSaved() {
      this.closeDialog();
      this.fetchEquipment();
      this.$store.commit('notification/SHOW_SUCCESS', 'Оборудование успешно сохранено');
    },

    confirmDelete(equipment) {
      this.selectedEquipment = equipment;
      this.deleteDialog = true;
    },

    async deleteEquipment() {
      if (!this.selectedEquipment) return;

      this.deleteLoading = true;
      this.error = null;

      try {
        await this.$store.dispatch('equipment/deleteEquipment', this.selectedEquipment.id);
        this.$store.commit('notification/SHOW_SUCCESS', 'Оборудование успешно удалено');
        this.deleteDialog = false;
        this.fetchEquipment();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        this.error = 'Ошибка при удалении оборудования';
      } finally {
        this.deleteLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-';

      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU').format(date);
      } catch (e) {
        return '-';
      }
    },

    getImageUrl(imagePath) {
      if (!imagePath) return '';

      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      return `${process.env.VUE_APP_API_URL || ''}/files/${imagePath}`;
    },

    getStatusColor(status) {
      if (!status || !status.color) return 'grey';
      return status.color;
    }
  }
};
</script>

<style scoped>
.equipment-list {
  width: 100%;
}
</style>