<template>
  <div class="request-list">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-4">Управление заявками</h1>

          <!-- Панель фильтров -->
          <v-card class="mb-4">
            <v-card-title>
              <v-icon left>mdi-filter</v-icon>
              Фильтры
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="showFilterDialog = true"
                small
              >
                Расширенный фильтр
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="filters.search"
                    label="Поиск"
                    prepend-icon="mdi-magnify"
                    clearable
                    @keyup.enter="loadRequests"
                    @click:clear="loadRequests"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="filters.statusIds"
                    :items="statuses"
                    item-text="name"
                    item-value="id"
                    label="Статус"
                    multiple
                    chips
                    small-chips
                    prepend-icon="mdi-check-circle"
                    @change="loadRequests"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="filters.priorityIds"
                    :items="priorities"
                    item-text="name"
                    item-value="id"
                    label="Приоритет"
                    multiple
                    chips
                    small-chips
                    prepend-icon="mdi-flag"
                    @change="loadRequests"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Кнопка создания заявки -->
          <v-btn
            color="primary"
            class="mb-4"
            @click="showCreateDialog = true"
            large
          >
            <v-icon left>mdi-plus</v-icon>
            Создать заявку
          </v-btn>

          <!-- Таблица заявок -->
          <v-data-table
            :headers="headers"
            :items="requests"
            :loading="loading"
            :server-items-length="totalRequests"
            :options.sync="options"
            :footer-props="{
              'items-per-page-options': [10, 25, 50, 100],
            }"
            @update:options="onOptionsChange"
            class="elevation-1"
          >
            <!-- Столбец номера заявки -->
            <template v-slot:item.number="{ item }">
              <a @click="openRequestDetails(item.id)" class="request-link">
                {{ item.number }}
              </a>
            </template>

            <!-- Столбец статуса -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                text-color="white"
                small
              >
                {{ item.status.name }}
              </v-chip>
            </template>

            <!-- Столбец приоритета -->
            <template v-slot:item.priority="{ item }">
              <v-chip
                :color="getPriorityColor(item.priority)"
                text-color="white"
                small
              >
                {{ item.priority.name }}
              </v-chip>
            </template>

            <!-- Столбец типа заявки -->
            <template v-slot:item.type="{ item }">
              <v-chip
                :color="getTypeColor(item.type)"
                text-color="white"
                small
              >
                {{ item.type.name }}
              </v-chip>
            </template>

            <!-- Столбец даты создания -->
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <!-- Столбец действий -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                small
                @click="openRequestDetails(item.id)"
                title="Просмотр"
              >
                <v-icon small>mdi-eye</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                @click="editRequest(item)"
                title="Редактировать"
                v-if="canEditRequest(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                @click="openChangeStatusDialog(item)"
                title="Изменить статус"
                v-if="canChangeStatus(item)"
              >
                <v-icon small>mdi-check-circle</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                @click="openAssignDialog(item)"
                title="Назначить"
                v-if="canAssignRequest(item)"
              >
                <v-icon small>mdi-account-assign</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <!-- Диалог создания заявки -->
    <RequestCreateDialog
      v-if="showCreateDialog"
      @close="showCreateDialog = false"
      @created="onRequestCreated"
    />

    <!-- Диалог редактирования заявки -->
    <RequestEditDialog
      v-if="showEditDialog"
      :request="selectedRequest"
      @close="showEditDialog = false"
      @updated="onRequestUpdated"
    />

    <!-- Диалог изменения статуса -->
    <RequestStatusDialog
      v-if="showStatusDialog"
      :request="selectedRequest"
      @close="showStatusDialog = false"
      @status-changed="onStatusChanged"
    />

    <!-- Диалог назначения исполнителя -->
    <RequestAssignDialog
      v-if="showAssignDialog"
      :request="selectedRequest"
      @close="showAssignDialog = false"
      @assigned="onRequestAssigned"
    />

    <!-- Диалог расширенного фильтра -->
    <RequestFilterDialog
      v-if="showFilterDialog"
      :current-filters="filters"
      @close="showFilterDialog = false"
      @filter="applyAdvancedFilters"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import RequestCreateDialog from '@/components/requests/RequestCreateDialog.vue';
import RequestEditDialog from '@/components/requests/RequestEditDialog.vue';
import RequestStatusDialog from '@/components/requests/RequestStatusDialog.vue';
import RequestAssignDialog from '@/components/requests/RequestAssignDialog.vue';
import RequestFilterDialog from '@/components/requests/RequestFilterDialog.vue';
import { formatDate } from '@/utils/dateUtils';

export default {
  name: 'RequestListView',
  components: {
    RequestCreateDialog,
    RequestEditDialog,
    RequestStatusDialog,
    RequestAssignDialog,
    RequestFilterDialog
  },
  data() {
    return {
      requests: [],
      loading: false,
      totalRequests: 0,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['createdAt'],
        sortDesc: [true],
      },
      headers: [
        { text: 'Номер', value: 'number', sortable: true },
        { text: 'Название', value: 'title', sortable: true },
        { text: 'Статус', value: 'status', sortable: false },
        { text: 'Приоритет', value: 'priority', sortable: false },
        { text: 'Тип', value: 'type', sortable: false },
        { text: 'Создатель', value: 'createdBy.name', sortable: true },
        { text: 'Исполнитель', value: 'assignedTo.name', sortable: true },
        { text: 'Дата создания', value: 'createdAt', sortable: true },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center' },
      ],
      filters: {
        search: '',
        statusIds: [],
        typeIds: [],
        priorityIds: [],
        createdById: null,
        assignedToId: null,
        createdFromDate: null,
        createdToDate: null,
      },
      showCreateDialog: false,
      showEditDialog: false,
      showStatusDialog: false,
      showAssignDialog: false,
      showFilterDialog: false,
      selectedRequest: null,
    };
  },
  computed: {
    ...mapGetters({
      statuses: 'requests/getStatuses',
      types: 'requests/getTypes',
      priorities: 'requests/getPriorities',
      currentUser: 'auth/getUser',
    }),
    isAdmin() {
      return this.currentUser && this.currentUser.role === 'admin';
    },
    isTechnician() {
      return this.currentUser && this.currentUser.role === 'technician';
    },
  },
  created() {
    this.loadResources();
    this.loadRequests();
  },
  methods: {
    formatDate,

    async loadResources() {
      try {
        await Promise.all([
          this.$store.dispatch('requests/fetchStatuses'),
          this.$store.dispatch('requests/fetchTypes'),
          this.$store.dispatch('requests/fetchPriorities'),
        ]);
      } catch (error) {
        this.$store.dispatch('notifications/showError',
          'Ошибка при загрузке справочных данных'
        );
      }
    },

    async loadRequests() {
      this.loading = true;
      try {
        const { page, itemsPerPage, sortBy, sortDesc } = this.options;

        // Формируем параметры для API запроса
        const params = {
          page,
          limit: itemsPerPage,
          sortBy: sortBy[0] || 'createdAt',
          order: sortDesc[0] ? 'DESC' : 'ASC',
          ...this.filters
        };

        const response = await this.$store.dispatch('requests/fetchRequests', params);
        this.requests = response.data;
        this.totalRequests = response.total;
      } catch (error) {
        this.$store.dispatch('notifications/showError',
          'Ошибка при загрузке списка заявок'
        );
      } finally {
        this.loading = false;
      }
    },

    onOptionsChange() {
      this.loadRequests();
    },

    openRequestDetails(id) {
      this.$router.push({ name: 'RequestDetails', params: { id } });
    },

    editRequest(request) {
      this.selectedRequest = request;
      this.showEditDialog = true;
    },

    openChangeStatusDialog(request) {
      this.selectedRequest = request;
      this.showStatusDialog = true;
    },

    openAssignDialog(request) {
      this.selectedRequest = request;
      this.showAssignDialog = true;
    },

    onRequestCreated() {
      this.showCreateDialog = false;
      this.$store.dispatch('notifications/showSuccess', 'Заявка успешно создана');
      this.loadRequests();
    },

    onRequestUpdated() {
      this.showEditDialog = false;
      this.$store.dispatch('notifications/showSuccess', 'Заявка успешно обновлена');
      this.loadRequests();
    },

    onStatusChanged() {
      this.showStatusDialog = false;
      this.$store.dispatch('notifications/showSuccess', 'Статус заявки изменен');
      this.loadRequests();
    },

    onRequestAssigned() {
      this.showAssignDialog = false;
      this.$store.dispatch('notifications/showSuccess', 'Исполнитель назначен');
      this.loadRequests();
    },

    applyAdvancedFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
      this.showFilterDialog = false;
      this.options.page = 1; // Сбрасываем на первую страницу
      this.loadRequests();
    },

    getStatusColor(status) {
      return status?.color || '#757575';
    },

    getPriorityColor(priority) {
      return priority?.color || '#757575';
    },

    getTypeColor(type) {
      return type?.color || '#757575';
    },

    canEditRequest(request) {
      if (this.isAdmin) return true;
      if (this.isTechnician && request.assignedToId === this.currentUser.id) return true;
      return request.createdById === this.currentUser.id && !request.assignedToId;
    },

    canChangeStatus(request) {
      if (this.isAdmin) return true;
      return this.isTechnician && request.assignedToId === this.currentUser.id;
    },

    canAssignRequest() {
      return this.isAdmin;
    }
  }
};
</script>

<style scoped>
.request-link {
  color: #1976D2;
  cursor: pointer;
  text-decoration: none;
}

.request-link:hover {
  text-decoration: underline;
}
</style>
