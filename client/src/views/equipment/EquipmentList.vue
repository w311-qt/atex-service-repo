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
                @input="debouncedSearch"
              ></v-text-field>
            </v-card-title>

            <v-card-text>
              <!-- Фильтры -->
              <v-row class="mb-4">
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="selectedCategory"
                    :items="categories"
                    item-text="name"
                    item-value="id"
                    label="Категория"
                    clearable
                    @change="applyFilters"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="selectedStatus"
                    :items="statuses"
                    item-text="name"
                    item-value="id"
                    label="Статус"
                    clearable
                    @change="applyFilters"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model="inventoryNumberFilter"
                    label="Инвентарный номер"
                    clearable
                    @input="debouncedSearch"
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
                    color="success"
                    @click="openCreateDialog"
                    v-if="canManageEquipment"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Добавить
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Таблица оборудования -->
              <v-data-table
                :headers="headers"
                :items="equipment"
                :loading="loading"
                :server-items-length="totalItems"
                :options.sync="options"
                :footer-props="{
                  'items-per-page-options': [10, 25, 50]
                }"
                @update:options="fetchEquipment"
              >
                <template v-slot:item.image="{ item }">
                  <v-avatar size="36" v-if="item.image">
                    <img :src="getImageUrl(item.image)" alt="Изображение" />
                  </v-avatar>
                  <v-icon v-else>mdi-image-off</v-icon>
                </template>

                <template v-slot:item.category.name="{ item }">
                  <v-chip small>{{ item.category ? item.category.name : '-' }}</v-chip>
                </template>

                <template v-slot:item.status.name="{ item }">
                  <v-chip
                    small
                    :color="getStatusColor(item.status)"
                    text-color="white"
                  >
                    {{ item.status ? item.status.name : '-' }}
                  </v-chip>
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
                    small
                    class="mr-2"
                    @click="editEquipment(item)"
                    v-if="canManageEquipment"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    small
                    @click="confirmDelete(item)"
                    v-if="isAdmin"
                  >
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Диалог создания/редактирования оборудования -->
    <equipment-form-dialog
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
          <v-btn color="red darken-1" text @click="deleteEquipment">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import EquipmentFormDialog from '@/components/equipment/EquipmentFormDialog.vue';
import debounce from 'lodash/debounce';

export default {
  name: 'EquipmentList',
  components: {
    EquipmentFormDialog
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
      totalItems: 0,
      loading: false
    };
  },
  computed: {
    ...mapGetters('equipment', [
      'allCategories',
      'allStatuses',
    ]),
    ...mapGetters('auth', [
      'isAdmin',
      'isTechnician'
    ]),
    canManageEquipment() {
      return this.isAdmin || this.isTechnician;
    },
    equipment() {
      return this.$store.state.equipment.equipmentList || [];
    },
    categories() {
      return this.allCategories || [];
    },
    statuses() {
      return this.allStatuses || [];
    }
  },
  created() {
    this.debouncedSearch = debounce(this.applyFilters, 300);
    this.fetchEquipment();
    this.loadCategories();
    this.loadStatuses();
  },
  methods: {
    ...mapActions('equipment', [
      'fetchEquipment',
      'fetchCategories',
      'fetchStatuses',
      'deleteEquipment'
    ]),

    loadCategories() {
      this.fetchCategories();
    },

    loadStatuses() {
      this.fetchStatuses();
    },

    async fetchEquipment() {
      this.loading = true;
      try {
        const params = {
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.options.sortBy[0],
          order: this.options.sortDesc[0] ? 'DESC' : 'ASC',
          search: this.search,
          categoryId: this.selectedCategory,
          statusId: this.selectedStatus,
          inventoryNumber: this.inventoryNumberFilter
        };

        const response = await this.$store.dispatch('equipment/fetchEquipment', params);
        this.totalItems = response.total;
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке оборудования');
      } finally {
        this.loading = false;
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
      this.$router.push({ name: 'EquipmentDetails', params: { id: equipment.id } });
    },

    editEquipment(equipment) {
      this.editMode = true;
      this.selectedEquipment = equipment;
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.selectedEquipment = null;
    },

    onEquipmentSaved() {
      this.closeDialog();
      this.fetchEquipment();
    },

    confirmDelete(equipment) {
      this.selectedEquipment = equipment;
      this.deleteDialog = true;
    },

    async deleteEquipment() {
      try {
        await this.$store.dispatch('equipment/deleteEquipment', this.selectedEquipment.id);
        this.$store.commit('notification/SHOW_SUCCESS', 'Оборудование успешно удалено');
        this.deleteDialog = false;
        this.fetchEquipment();
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при удалении оборудования');
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU').format(date);
    },

    getImageUrl(imagePath) {
      if (!imagePath) return '';
      return `${process.env.VUE_APP_API_URL}/files/${imagePath}`;
    },

    getStatusColor(status) {
      if (!status) return 'grey';
      return status.color || 'blue';
    }
  }
};
</script>

<style scoped>
.equipment-list {
  width: 100%;
}
</style>
