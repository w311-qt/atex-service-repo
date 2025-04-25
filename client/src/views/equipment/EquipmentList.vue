<template>
  <div class="equipment-list">
    <v-card class="mb-4">
      <v-card-title>
        Оборудование
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          class="mx-4"
          @input="debouncedSearch"
        ></v-text-field>
        <v-btn color="primary" @click="openAddDialog">
          <v-icon left>mdi-plus</v-icon>
          Добавить
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedCategories"
              :items="categories"
              item-text="name"
              item-value="id"
              label="Категории"
              multiple
              chips
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStatuses"
              :items="statuses"
              item-text="name"
              item-value="id"
              label="Статусы"
              multiple
              chips
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedAssignee"
              :items="users"
              item-text="name"
              item-value="id"
              label="Ответственный"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-btn color="secondary" @click="resetFilters">
              Сбросить фильтры
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="equipment"
      :options.sync="options"
      :server-items-length="totalItems"
      :loading="loading"
      :footer-props="{
        'items-per-page-options': [10, 20, 50],
      }"
      class="elevation-1"
    >
      <!-- Изображение оборудования -->
      <template v-slot:item.image="{ item }">
        <v-avatar v-if="item.image" size="40" class="mr-2">
          <v-img :src="getImageUrl(item.image)" contain></v-img>
        </v-avatar>
        <v-icon v-else>mdi-desktop-tower-monitor</v-icon>
      </template>

      <!-- Статус оборудования -->
      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          text-color="white"
          small
        >
          {{ item.status.name }}
        </v-chip>
      </template>

      <!-- Дата приобретения -->
      <template v-slot:item.purchaseDate="{ item }">
        {{ formatDate(item.purchaseDate) }}
      </template>

      <!-- Действия -->
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click="viewEquipment(item)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </template>
          <span>Просмотр</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click="editEquipment(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Редактировать</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              small
              color="error"
              v-bind="attrs"
              v-on="on"
              @click="confirmDelete(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Удалить</span>
        </v-tooltip>
      </template>

      <!-- Нет данных -->
      <template v-slot:no-data>
        <v-alert
          type="info"
          outlined
        >
          Оборудование не найдено.
          <v-btn text color="primary" @click="openAddDialog">
            Добавить оборудование
          </v-btn>
        </v-alert>
      </template>
    </v-data-table>

    <!-- Диалог удаления -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Удаление оборудования</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить оборудование "{{ selectedItem ? selectedItem.name : '' }}"?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="error" text @click="deleteItem">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import debounce from 'lodash/debounce';
import moment from 'moment';

export default {
  name: 'EquipmentList',

  data() {
    return {
      search: '',
      loading: false,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['name'],
        sortDesc: [false]
      },
      headers: [
        { text: 'Фото', value: 'image', sortable: false, width: '80px' },
        { text: 'Наименование', value: 'name', sortable: true },
        { text: 'Инв. номер', value: 'inventoryNumber', sortable: true },
        { text: 'Модель', value: 'model', sortable: true },
        { text: 'Категория', value: 'category.name', sortable: true },
        { text: 'Статус', value: 'status', sortable: false },
        { text: 'Расположение', value: 'location', sortable: true },
        { text: 'Ответственный', value: 'assignedTo.name', sortable: true },
        { text: 'Дата приобретения', value: 'purchaseDate', sortable: true },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '150px' }
      ],
      equipment: [],
      totalItems: 0,
      selectedCategories: [],
      selectedStatuses: [],
      selectedAssignee: null,
      categories: [],
      statuses: [],
      users: [],
      deleteDialog: false,
      selectedItem: null,
    };
  },

  computed: {
    ...mapGetters({
      apiBaseUrl: 'apiBaseUrl'
    }),

    filters() {
      return {
        search: this.search,
        categoryIds: this.selectedCategories.length ? this.selectedCategories : undefined,
        statusIds: this.selectedStatuses.length ? this.selectedStatuses : undefined,
        assignedToId: this.selectedAssignee || undefined
      };
    }
  },

  created() {
    // Инициализация метода с debounce
    this.debouncedSearch = debounce(() => {
      this.applyFilters();
    }, 500);

    // Загрузка справочников при создании компонента
    this.loadCategories();
    this.loadStatuses();
    this.loadUsers();
  },

  mounted() {
    // Загрузка данных после монтирования компонента
    this.loadEquipment();
  },

  watch: {
    options: {
      handler() {
        this.loadEquipment();
      },
      deep: true
    }
  },

  methods: {
    ...mapActions([
      'showSuccess',
      'showError'
    ]),

    async loadEquipment() {
      this.loading = true;
      try {
        // Формирование параметров запроса
        const params = {
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.options.sortBy[0] || 'name',
          order: this.options.sortDesc[0] ? 'DESC' : 'ASC',
          ...this.filters
        };

        // Запрос к API
        const response = await this.$axios.get('/equipment', { params });

        // Обновление данных
        this.equipment = response.data.data;
        this.totalItems = response.data.total;
      } catch (error) {
        console.error('Ошибка при загрузке оборудования:', error);
        this.showError('Не удалось загрузить список оборудования');
      } finally {
        this.loading = false;
      }
    },

    async loadCategories() {
      try {
        const response = await this.$axios.get('/equipment/categories');
        this.categories = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    },

    async loadStatuses() {
      try {
        const response = await this.$axios.get('/equipment/statuses');
        this.statuses = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке статусов:', error);
      }
    },

    async loadUsers() {
      try {
        const response = await this.$axios.get('/users/technicians');
        this.users = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    },

    applyFilters() {
      // Сброс пагинации при применении фильтров
      this.options.page = 1;
      this.loadEquipment();
    },

    resetFilters() {
      this.search = '';
      this.selectedCategories = [];
      this.selectedStatuses = [];
      this.selectedAssignee = null;
      this.applyFilters();
    },

    openAddDialog() {
      this.$router.push({ name: 'equipment-add' });
    },

    viewEquipment(item) {
      this.$router.push({ name: 'equipment-details', params: { id: item.id } });
    },

    editEquipment(item) {
      this.$router.push({ name: 'equipment-edit', params: { id: item.id } });
    },

    confirmDelete(item) {
      this.selectedItem = item;
      this.deleteDialog = true;
    },

    async deleteItem() {
      if (!this.selectedItem) return;

      try {
        await this.$axios.delete(`/equipment/${this.selectedItem.id}`);
        this.deleteDialog = false;
        this.showSuccess('Оборудование успешно удалено');
        this.loadEquipment();
      } catch (error) {
        console.error('Ошибка при удалении оборудования:', error);
        this.showError(error.response?.data?.message || 'Не удалось удалить оборудование');
      }
    },

    getImageUrl(imageName) {
      if (!imageName) return null;
      return `${this.apiBaseUrl}/files/${imageName}`;
    },

    formatDate(date) {
      if (!date) return '-';
      return moment(date).format('DD.MM.YYYY');
    },

    getStatusColor(status) {
      if (!status) return 'grey';

      // Можно настроить цвета в соответствии с вашими статусами
      const colors = {
        'Новый': 'blue',
        'Рабочее': 'green',
        'Дефектное': 'orange',
        'Нерабочее': 'red'
      };

      return status.color || colors[status.name] || 'grey';
    }
  }
};
</script>

<style scoped>
.equipment-list {
  padding: 16px;
}
</style>