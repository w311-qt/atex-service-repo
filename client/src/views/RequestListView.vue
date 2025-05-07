<template>
  <div class="request-list">
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Управление заявками</h1>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="openCreateDialog"
        >
          <v-icon left>mdi-plus</v-icon>
          Создать заявку
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Фильтры -->
    <v-card outlined class="mb-4">
      <v-card-title>
        <v-icon left>mdi-filter</v-icon>
        Фильтры
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.search"
              label="Поиск"
              prepend-icon="mdi-magnify"
              clearable
              @input="debouncedSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.statusId"
              :items="requestStatuses"
              item-text="name"
              item-value="id"
              label="Статус"
              prepend-icon="mdi-tag"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.typeId"
              :items="requestTypes"
              item-text="name"
              item-value="id"
              label="Тип заявки"
              prepend-icon="mdi-clipboard-text"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.priorityId"
              :items="requestPriorities"
              item-text="name"
              item-value="id"
              label="Приоритет"
              prepend-icon="mdi-flag"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.assignedToId"
              :items="technicians"
              item-text="name"
              item-value="id"
              label="Исполнитель"
              prepend-icon="mdi-account-wrench"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-menu
              ref="fromDateMenu"
              v-model="fromDateMenu"
              :close-on-content-click="false"
              :return-value.sync="filters.dateFrom"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="filters.dateFrom"
                  label="Дата создания от"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="filters.dateFrom"
                no-title
                scrollable
                @input="fromDateMenu = false; applyFilters()"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-menu
              ref="toDateMenu"
              v-model="toDateMenu"
              :close-on-content-click="false"
              :return-value.sync="filters.dateTo"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="filters.dateTo"
                  label="Дата создания до"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="filters.dateTo"
                no-title
                scrollable
                @input="toDateMenu = false; applyFilters()"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="6" md="3" class="d-flex align-center">
            <v-checkbox
              v-model="filters.myRequests"
              label="Мои заявки"
              @change="applyFilters"
            ></v-checkbox>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              class="mr-2"
              @click="resetFilters"
            >
              Сбросить фильтры
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Таблица заявок -->
    <v-card outlined>
      <v-data-table
        :headers="headers"
        :items="requests"
        :loading="loading"
        :server-items-length="totalRequests"
        :options.sync="options"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100],
          'show-current-page': true,
          'show-first-last-page': true
        }"
        @update:options="fetchRequests"
        class="request-table"
      >
        <template #item.number="{ item }">
          <v-btn
            text
            color="primary"
            small
            :to="{ name: 'RequestDetails', params: { id: item.id } }"
          >
            {{ item.number }}
          </v-btn>
        </template>

        <template #item.type.name="{ item }">
          <v-chip
            small
            :color="getRequestTypeColor(item.type)"
            text-color="white"
          >
            {{ item.type ? item.type.name : 'Не указан' }}
          </v-chip>
        </template>

        <template #item.status.name="{ item }">
          <v-chip
            small
            :color="getStatusColor(item.status)"
            text-color="white"
          >
            {{ item.status ? item.status.name : 'Не указан' }}
          </v-chip>
        </template>

        <template #item.priority.name="{ item }">
          <v-chip
            small
            outlined
            :color="getPriorityColor(item.priority)"
          >
            {{ item.priority ? item.priority.name : 'Не указан' }}
          </v-chip>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.assignedTo.name="{ item }">
          <div v-if="item.assignedTo">
            {{ item.assignedTo.name }}
          </div>
          <div v-else class="grey--text">Не назначен</div>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="primary"
                v-bind="attrs"
                v-on="on"
                :to="{ name: 'RequestDetails', params: { id: item.id } }"
              >
                <v-icon small>mdi-eye</v-icon>
              </v-btn>
            </template>
            <span>Просмотр</span>
          </v-tooltip>

          <v-tooltip bottom v-if="canEditRequest(item)">
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="success"
                v-bind="attrs"
                v-on="on"
                @click="editRequest(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Редактировать</span>
          </v-tooltip>

          <v-tooltip bottom v-if="isAdmin || (item.assignedTo && item.assignedTo.id === currentUser.id)">
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="orange"
                v-bind="attrs"
                v-on="on"
                @click="changeStatus(item)"
              >
                <v-icon small>mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>Изменить статус</span>
          </v-tooltip>
        </template>

        <template #no-data>
          <div class="text-center pa-5">
            <v-icon size="64" color="grey lighten-1">mdi-clipboard-text-outline</v-icon>
            <div class="mt-3 grey--text">Заявки не найдены</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания заявки -->
    <request-create-dialog
      v-if="createDialog"
      :dialog="createDialog"
      :equipment-id="selectedEquipmentId"
      @close="closeCreateDialog"
      @saved="onRequestSaved"
    ></request-create-dialog>

    <!-- Диалог изменения статуса -->
    <request-status-dialog
      v-if="statusDialog"
      :dialog="statusDialog"
      :request="selectedRequest"
      @close="closeStatusDialog"
      @updated="fetchRequests"
    ></request-status-dialog>

    <!-- Диалог редактирования заявки -->
    <request-edit-dialog
      v-if="editDialog"
      :dialog="editDialog"
      :request="selectedRequest"
      @close="closeEditDialog"
      @updated="fetchRequests"
    ></request-edit-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import debounce from 'lodash/debounce';
import RequestCreateDialog from '@/components/requests/RequestCreateDialog.vue';
import RequestStatusDialog from '@/components/requests/RequestStatusDialog.vue';
import RequestEditDialog from '@/components/requests/ReuestEditDialog.vue';
import { formatDate } from '@/utils/dateUtils';

export default {
  name: 'RequestListView',
  components: {
    RequestCreateDialog,
    RequestStatusDialog,
    RequestEditDialog
  },
  data() {
    return {
      loading: false,
      requests: [],
      totalRequests: 0,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['createdAt'],
        sortDesc: [true]
      },
      headers: [
        { text: 'Номер', value: 'number', sortable: true, width: '100px' },
        { text: 'Тема', value: 'title', sortable: true },
        { text: 'Тип', value: 'type.name', sortable: false, width: '120px' },
        { text: 'Статус', value: 'status.name', sortable: false, width: '120px' },
        { text: 'Приоритет', value: 'priority.name', sortable: false, width: '120px' },
        { text: 'Создана', value: 'createdAt', sortable: true, width: '130px' },
        { text: 'Исполнитель', value: 'assignedTo.name', sortable: false, width: '150px' },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '120px' }
      ],
      filters: {
        search: '',
        statusId: null,
        typeId: null,
        priorityId: null,
        assignedToId: null,
        dateFrom: null,
        dateTo: null,
        myRequests: false
      },
      fromDateMenu: false,
      toDateMenu: false,
      createDialog: false,
      statusDialog: false,
      editDialog: false,
      selectedRequest: null,
      selectedEquipmentId: null
    };
  },
  computed: {
    ...mapGetters('auth', [
      'currentUser',
      'isAdmin',
      'isTechnician'
    ]),
    ...mapGetters('requests', [
      'allRequestTypes',
      'allRequestStatuses',
      'allRequestPriorities'
    ]),
    ...mapGetters('users', [
      'allTechnicians'
    ]),
    requestTypes() {
      return this.allRequestTypes || [];
    },
    requestStatuses() {
      return this.allRequestStatuses || [];
    },
    requestPriorities() {
      return this.allRequestPriorities || [];
    },
    technicians() {
      return this.allTechnicians || [];
    }
  },
  created() {
    this.debouncedSearch = debounce(this.applyFilters, 300);
    this.loadReferenceData();
    this.fetchRequests();

    // Проверка на наличие параметра equipmentId в маршруте
    const equipmentId = this.$route.query.equipmentId;
    if (equipmentId) {
      this.selectedEquipmentId = equipmentId;
      this.openCreateDialog();
    }
  },
  methods: {
    async loadReferenceData() {
      try {
        if (this.requestStatuses.length === 0) {
          await this.$store.dispatch('requests/fetchRequestStatuses');
        }
        if (this.requestTypes.length === 0) {
          await this.$store.dispatch('requests/fetchRequestTypes');
        }
        if (this.requestPriorities.length === 0) {
          await this.$store.dispatch('requests/fetchRequestPriorities');
        }
        if (this.technicians.length === 0) {
          await this.$store.dispatch('users/fetchTechnicians');
        }
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке справочных данных');
      }
    },

    async fetchRequests() {
      this.loading = true;
      try {
        const params = {
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.options.sortBy[0],
          order: this.options.sortDesc[0] ? 'DESC' : 'ASC',
          search: this.filters.search,
          statusId: this.filters.statusId,
          typeId: this.filters.typeId,
          priorityId: this.filters.priorityId,
          assignedToId: this.filters.assignedToId,
          dateFrom: this.filters.dateFrom,
          dateTo: this.filters.dateTo
        };

        // Если выбран фильтр "Мои заявки"
        if (this.filters.myRequests && this.currentUser) {
          if (this.isTechnician) {
            params.assignedToId = this.currentUser.id;
          } else {
            params.createdById = this.currentUser.id;
          }
        }

        const response = await this.$store.dispatch('requests/fetchRequests', params);
        this.requests = response.data;
        this.totalRequests = response.total;
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке заявок');
      } finally {
        this.loading = false;
      }
    },

    applyFilters() {
      this.options.page = 1;
      this.fetchRequests();
    },

    resetFilters() {
      this.filters = {
        search: '',
        statusId: null,
        typeId: null,
        priorityId: null,
        assignedToId: null,
        dateFrom: null,
        dateTo: null,
        myRequests: false
      };
      this.applyFilters();
    },

    openCreateDialog() {
      this.createDialog = true;
    },

    closeCreateDialog() {
      this.createDialog = false;
      this.selectedEquipmentId = null;

      // Убираем параметр equipmentId из URL, если он там есть
      if (this.$route.query.equipmentId) {
        this.$router.replace({ query: { ...this.$route.query, equipmentId: undefined } });
      }
    },

    onRequestSaved() {
      this.fetchRequests();
      this.closeCreateDialog();
    },

    editRequest(request) {
      this.selectedRequest = request;
      this.editDialog = true;
    },

    closeEditDialog() {
      this.editDialog = false;
      this.selectedRequest = null;
    },

    changeStatus(request) {
      this.selectedRequest = request;
      this.statusDialog = true;
    },

    closeStatusDialog() {
      this.statusDialog = false;
      this.selectedRequest = null;
    },

    canEditRequest(request) {
      if (!request || !this.currentUser) return false;

      // Администраторы могут редактировать любые заявки
      if (this.isAdmin) return true;

      // Техники могут редактировать назначенные им заявки
      if (this.isTechnician && request.assignedToId === this.currentUser.id) return true;

      // Пользователи могут редактировать только свои заявки в статусе "Новая"
      if (request.createdById === this.currentUser.id) {
        // Проверяем статус "Новая" (предполагаем, что у статуса "Новая" есть специфическое имя)
        const newStatus = this.requestStatuses.find(status => status.name === 'Новая');
        return request.statusId === newStatus?.id;
      }

      return false;
    },

    formatDate(dateString) {
      return formatDate(dateString);
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

    getPriorityColor(priority) {
      if (!priority) return 'grey';

      const colorMap = {
        'Низкий': 'success',
        'Средний': 'info',
        'Высокий': 'warning',
        'Критический': 'error'
      };

      return colorMap[priority.name] || priority.color || 'grey';
    },

    getRequestTypeColor(type) {
      if (!type) return 'grey';

      const colorMap = {
        'Ремонт': 'red',
        'Заправка картриджа': 'blue',
        'Утилизация': 'deep-purple',
        'Перемещение': 'teal'
      };

      return colorMap[type.name] || type.color || 'grey';
    }
  }
};
</script>

<style scoped>
.request-table {
  width: 100%;
}
</style>