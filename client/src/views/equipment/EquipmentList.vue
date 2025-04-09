<!-- client/src/views/equipment/EquipmentList.vue -->
<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between py-2">
        <h1 class="text-h5">Управление оборудованием</h1>
        <v-btn
          color="primary"
          depressed
          @click="openAddDialog"
        >
          <v-icon left>mdi-plus</v-icon>
          Добавить оборудование
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Фильтры и поиск -->
    <v-card outlined class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4" md="4">
            <v-text-field
              v-model="filters.search"
              label="Поиск по наименованию, модели или инв.номеру"
              prepend-icon="mdi-magnify"
              clearable
              hide-details
              outlined
              dense
              @input="applyFilters"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-select
              v-model="filters.categoryId"
              :items="categoryOptions"
              label="Категория"
              clearable
              hide-details
              outlined
              dense
              @change="applyFilters"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-select
              v-model="filters.statusId"
              :items="statusOptions"
              label="Статус"
              clearable
              hide-details
              outlined
              dense
              @change="applyFilters"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-select
              v-model="filters.assignedToId"
              :items="userOptions"
              label="Назначено"
              clearable
              hide-details
              outlined
              dense
              @change="applyFilters"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-select
              v-model="filters.sortBy"
              :items="sortOptions"
              label="Сортировка"
              hide-details
              outlined
              dense
              @change="applyFilters"
            ></v-select>
          </v-col>
        </v-row>

        <v-expand-transition>
          <div v-if="showAdvancedFilters">
            <v-row class="mt-3">
              <v-col cols="12" sm="4" md="3">
                <v-menu
                  v-model="dateMenu1"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.purchaseDateFrom"
                      label="Дата поступления от"
                      readonly
                      hide-details
                      outlined
                      dense
                      prepend-icon="mdi-calendar"
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      @click:clear="filters.purchaseDateFrom = null"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="filters.purchaseDateFrom"
                    no-title
                    @input="dateMenu1 = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" sm="4" md="3">
                <v-menu
                  v-model="dateMenu2"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.purchaseDateTo"
                      label="Дата поступления до"
                      readonly
                      hide-details
                      outlined
                      dense
                      prepend-icon="mdi-calendar"
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      @click:clear="filters.purchaseDateTo = null"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="filters.purchaseDateTo"
                    no-title
                    @input="dateMenu2 = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" sm="4" md="3">
                <v-text-field
                  v-model="filters.location"
                  label="Местоположение"
                  hide-details
                  outlined
                  dense
                  prepend-icon="mdi-map-marker"
                  clearable
                  @input="applyFilters"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4" md="3">
                <v-btn
                  color="info"
                  text
                  @click="resetFilters"
                  class="mt-2"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Сбросить фильтры
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>

        <v-row>
          <v-col cols="12" class="text-center">
            <v-btn
              text
              color="primary"
              @click="showAdvancedFilters = !showAdvancedFilters"
            >
              {{ showAdvancedFilters ? 'Скрыть' : 'Показать' }} расширенные фильтры
              <v-icon right>{{ showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Список оборудования -->
    <v-card outlined>
      <v-data-table
        :headers="headers"
        :items="equipment"
        :loading="loading"
        :options.sync="pagination"
        :server-items-length="totalItems"
        :footer-props="{
          itemsPerPageOptions: [10, 25, 50],
        }"
        sort-by="createdAt"
        sort-desc
        @update:options="fetchData"
        class="elevation-0"
      >
        <template v-slot:item.image="{ item }">
          <v-avatar size="40" rounded>
            <v-img
              v-if="item.image"
              :src="`/api/files/${item.image}`"
              alt="Изображение"
            ></v-img>
            <v-icon v-else>mdi-desktop-classic</v-icon>
          </v-avatar>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            small
            text-color="white"
          >
            {{ item.status?.name || 'Не указан' }}
          </v-chip>
        </template>

        <template v-slot:item.category="{ item }">
          <div>{{ item.category?.name || 'Не указана' }}</div>
        </template>

        <template v-slot:item.assignedTo="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div v-if="item.assignedTo" v-bind="attrs" v-on="on">
                {{ item.assignedTo.name }}
              </div>
              <div v-else class="grey--text">Не назначено</div>
            </template>
            <span v-if="item.assignedTo">{{ item.assignedTo.department || '' }} {{ item.assignedTo.position || '' }}</span>
          </v-tooltip>
        </template>

        <template v-slot:item.purchaseDate="{ item }">
          <div>{{ formatDate(item.purchaseDate) }}</div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            color="primary"
            @click="viewEquipment(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>

          <v-btn
            icon
            small
            color="success"
            @click="editEquipment(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>

          <v-btn
            icon
            small
            color="error"
            @click="deleteEquipment(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-4">
            <v-icon size="50" color="grey lighten-1">mdi-database-off</v-icon>
            <div class="mt-2 grey--text text--darken-1">Оборудование не найдено</div>
          </div>
        </template>

        <template v-slot:progress>
          <v-progress-linear
            indeterminate
            color="primary"
          ></v-progress-linear>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          Удаление оборудования
        </v-card-title>

        <v-card-text>
          Вы действительно хотите удалить оборудование <strong>{{ selectedEquipment?.name }}</strong>? Это действие нельзя отменить.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="deleteDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
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
export default {
  name: 'EquipmentList',

  data() {
    return {
      loading: false,
      deleteLoading: false,
      equipment: [],
      totalItems: 0,

      // Фильтры
      filters: {
        search: '',
        categoryId: null,
        statusId: null,
        assignedToId: null,
        location: '',
        purchaseDateFrom: null,
        purchaseDateTo: null,
        sortBy: 'name'
      },

      showAdvancedFilters: false,
      dateMenu1: false,
      dateMenu2: false,

      // Пагинация
      pagination: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['name'],
        sortDesc: [false]
      },

      // Заголовки таблицы
      headers: [
        { text: '', value: 'image', width: '50px', sortable: false },
        { text: 'Наименование', value: 'name', width: '20%' },
        { text: 'Инв. номер', value: 'inventoryNumber', width: '10%' },
        { text: 'Модель', value: 'model', width: '10%' },
        { text: 'Категория', value: 'category', width: '10%' },
        { text: 'Статус', value: 'status', width: '10%' },
        { text: 'Ответственный', value: 'assignedTo', width: '15%' },
        { text: 'Дата поступления', value: 'purchaseDate', width: '10%' },
        { text: 'Действия', value: 'actions', sortable: false, width: '120px' }
      ],

      // Опции для фильтров
      categoryOptions: [
        { text: 'Мониторы', value: '1' },
        { text: 'Системные блоки', value: '2' },
        { text: 'Принтеры', value: '3' },
        { text: 'SSD', value: '4' }
      ],

      statusOptions: [
        { text: 'Новый', value: '1' },
        { text: 'Рабочий', value: '2' },
        { text: 'Дефектный', value: '3' },
        { text: 'Нерабочий', value: '4' }
      ],

      userOptions: [
        { text: 'Не назначено', value: 'unassigned' },
        { text: 'Иванов И.И.', value: '1' },
        { text: 'Петров П.П.', value: '2' },
        { text: 'Сидоров С.С.', value: '3' }
      ],

      sortOptions: [
        { text: 'По названию (А-Я)', value: 'name' },
        { text: 'По инв. номеру', value: 'inventoryNumber' },
        { text: 'По дате поступления', value: 'purchaseDate' },
        { text: 'По категории', value: 'category.name' }
      ],

      // Диалог удаления
      deleteDialog: false,
      selectedEquipment: null
    };
  },

  created() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      this.loading = true;

      try {
        // Здесь будет вызов API для получения списка оборудования
        // const response = await this.$store.dispatch('equipment/fetchList', {
        //   ...this.filters,
        //   page: this.pagination.page,
        //   limit: this.pagination.itemsPerPage,
        //   sortBy: this.pagination.sortBy[0],
        //   sortDesc: this.pagination.sortDesc[0]
        // });

        // Имитация задержки запроса
        await new Promise(resolve => setTimeout(resolve, 800));

        // Имитация данных от API
        this.equipment = this.getMockEquipment();
        this.totalItems = 48;
      } catch (error) {
        console.error('Error fetching equipment:', error);
        this.$toast.error('Ошибка при загрузке данных об оборудовании');
      } finally {
        this.loading = false;
      }
    },

    applyFilters() {
      this.pagination.page = 1;
      this.fetchData();
    },

    resetFilters() {
      this.filters = {
        search: '',
        categoryId: null,
        statusId: null,
        assignedToId: null,
        location: '',
        purchaseDateFrom: null,
        purchaseDateTo: null,
        sortBy: 'name'
      };

      this.applyFilters();
    },

    viewEquipment(item) {
      this.$router.push(`/equipment/${item.id}`);
    },

    editEquipment(item) {
      this.$router.push(`/equipment/${item.id}/edit`);
    },

    deleteEquipment(item) {
      this.selectedEquipment = item;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      if (!this.selectedEquipment) return;

      this.deleteLoading = true;

      try {
        // Здесь будет вызов API для удаления оборудования
        // await this.$store.dispatch('equipment/delete', this.selectedEquipment.id);

        // Имитация задержки запроса
        await new Promise(resolve => setTimeout(resolve, 800));

        // Обновление списка после удаления
        this.fetchData();
        this.$toast.success('Оборудование успешно удалено');
      } catch (error) {
        console.error('Error deleting equipment:', error);
        this.$toast.error('Ошибка при удалении оборудования');
      } finally {
        this.deleteLoading = false;
        this.deleteDialog = false;
        this.selectedEquipment = null;
      }
    },

    openAddDialog() {
      this.$router.push('/equipment/create');
    },

    formatDate(dateString) {
      if (!dateString) return '—';

      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    },

    getStatusColor(status) {
      if (!status) return 'grey';

      const colorMap = {
        'Новый': 'info',
        'Рабочий': 'success',
        'Дефектный': 'warning',
        'Нерабочий': 'error'
      };

      return colorMap[status.name] || 'grey';
    },

    // Временный метод для имитации данных
    getMockEquipment() {
      const statuses = [
        { id: '1', name: 'Новый', color: '#17a2b8' },
        { id: '2', name: 'Рабочий', color: '#28a745' },
        { id: '3', name: 'Дефектный', color: '#ffc107' },
        { id: '4', name: 'Нерабочий', color: '#dc3545' }
      ];

      const categories = [
        { id: '1', name: 'Мониторы' },
        { id: '2', name: 'Системные блоки' },
        { id: '3', name: 'Принтеры' },
        { id: '4', name: 'SSD' }
      ];

      const users = [
        { id: '1', name: 'Иванов И.И.', department: 'IT', position: 'Администратор' },
        { id: '2', name: 'Петров П.П.', department: 'Бухгалтерия', position: 'Главный бухгалтер' },
        { id: '3', name: 'Сидоров С.С.', department: 'IT', position: 'Техник' }
      ];

      return Array.from({ length: 10 }, (_, i) => {
        const id = (i + 1).toString();
        const categoryIndex = Math.floor(Math.random() * categories.length);
        const statusIndex = Math.floor(Math.random() * statuses.length);
        const hasUser = Math.random() > 0.3;
        const userIndex = hasUser ? Math.floor(Math.random() * users.length) : null;

        return {
          id,
          name: `Оборудование ${id}`,
          inventoryNumber: `INV-${2023}-${1000 + i}`,
          model: `Модель ${id}`,
          category: categories[categoryIndex],
          status: statuses[statusIndex],
          assignedTo: hasUser ? users[userIndex] : null,
          purchaseDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          image: i % 3 === 0 ? `equipment-${id}.jpg` : null
        };
      });
    }
  },
}
</script>

