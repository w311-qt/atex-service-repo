<template>
  <div class="request-assignment-page">
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Назначение заявок</h1>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="openAssignMultipleDialog"
        >
          <v-icon left>mdi-account-multiple-plus</v-icon>
          Массовое назначение
        </v-btn>
      </v-card-title>
    </v-card>

    <v-row>
      <v-col cols="12" md="3">
        <v-card outlined class="mb-4">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left>mdi-filter</v-icon>
            Фильтры
          </v-card-title>
          <v-card-text class="pa-4">
            <v-select
              v-model="selectedTechnician"
              :items="technicianOptions"
              label="Исполнитель"
              return-object
              @change="loadTechnicianRequests"
              :loading="technicianLoading"
              clearable
            >
              <template v-slot:selection="{ item }">
                <span>{{ item.name }}</span>
              </template>

              <template v-slot:item="{ item }">
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.department || item.position">
                    {{ item.department || '' }}{{ item.position ? ', ' + item.position : '' }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-select>

            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Статус заявки"
              @change="loadRequests"
              clearable
              class="mt-3"
            ></v-select>

            <v-select
              v-model="typeFilter"
              :items="typeOptions"
              label="Тип заявки"
              @change="loadRequests"
              clearable
              class="mt-3"
            ></v-select>

            <v-text-field
              v-model="searchQuery"
              label="Поиск"
              append-icon="mdi-magnify"
              clearable
              @input="onSearchInput"
              class="mt-3"
            ></v-text-field>

            <v-divider class="my-4"></v-divider>

            <v-btn
              color="primary"
              block
              @click="loadRequests"
              :loading="loading"
            >
              <v-icon left>mdi-refresh</v-icon>
              Обновить
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left>mdi-chart-box</v-icon>
            Статистика
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between mb-2">
              <span>Всего техников:</span>
              <span class="font-weight-bold">{{ technicianOptions.length }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Неназначенные заявки:</span>
              <span class="font-weight-bold">{{ unassignedCount }}</span>
            </div>
            <div class="d-flex justify-space-between mb-3">
              <span>Назначенные заявки:</span>
              <span class="font-weight-bold">{{ assignedCount }}</span>
            </div>

            <v-divider class="mb-3"></v-divider>

            <div class="text-center">
              <v-btn
                color="success"
                small
                @click="showUnassignedOnly = !showUnassignedOnly"
              >
                {{ showUnassignedOnly ? 'Показать все заявки' : 'Только неназначенные' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4 d-flex align-center">
            <div>
              <v-icon left>mdi-clipboard-text-outline</v-icon>
              {{ selectedTechnician
              ? `Заявки исполнителя: ${selectedTechnician.name}`
              : (showUnassignedOnly ? 'Неназначенные заявки' : 'Все заявки') }}
            </div>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              small
              @click="refreshRequests"
              :loading="loading"
              class="mr-2"
            >
              <v-icon left small>mdi-refresh</v-icon>
              Обновить
            </v-btn>
          </v-card-title>

          <v-data-table
            :headers="requestHeaders"
            :items="filteredRequests"
            :loading="loading"
            :search="searchQuery"
            sort-by="createdAt"
            sort-desc
            :footer-props="{
              'items-per-page-options': [10, 25, 50, 100]
            }"
          >
            <template v-slot:item.number="{ item }">
              <router-link
                :to="{ name: 'RequestDetails', params: { id: item.id }}"
                class="text-decoration-none"
              >
                {{ item.number }}
              </router-link>
            </template>

            <template v-slot:item.type="{ item }">
              <v-chip
                x-small
                :color="getTypeColor(item.type)"
                text-color="white"
              >
                {{ item.type ? item.type.name : 'Не указан' }}
              </v-chip>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                x-small
                :color="getStatusColor(item.status)"
                text-color="white"
              >
                {{ item.status ? item.status.name : 'Не указан' }}
              </v-chip>
            </template>

            <template v-slot:item.assignedTo="{ item }">
              <div v-if="item.assignedTo">
                {{ item.assignedTo.name }}
              </div>
              <div v-else class="grey--text">
                Не назначен
              </div>
            </template>

            <template v-slot:item.createdAt="{ item }">
              {{ formatDateTime(item.createdAt) }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    color="primary"
                    @click="openAssignDialog(item)"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon small>{{ item.assignedTo ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
                  </v-btn>
                </template>
                <span>{{ item.assignedTo ? 'Изменить исполнителя' : 'Назначить исполнителя' }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    color="info"
                    class="ml-1"
                    :to="{ name: 'RequestDetails', params: { id: item.id }}"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon small>mdi-eye</v-icon>
                  </v-btn>
                </template>
                <span>Просмотреть заявку</span>
              </v-tooltip>
            </template>

            <template v-slot:no-data>
              <div class="text-center py-3">
                <v-icon large color="grey lighten-1">mdi-clipboard-text-off</v-icon>
                <p class="mt-2 grey--text">{{ loading ? 'Загрузка заявок...' : 'Заявки не найдены' }}</p>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <request-assignment-dialog
      :dialog="assignDialog"
      :request-id="selectedRequestId"
      @close="assignDialog = false"
      @assigned="onRequestAssigned"
    />

    <assign-requests-dialog
      :dialog="assignMultipleDialog"
      :initial-technician-id="selectedTechnician ? selectedTechnician.id : null"
      @close="assignMultipleDialog = false"
      @assigned="onMultipleAssigned"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import RequestAssignmentDialog from '@/components/requests/RequestAssignmentDialog.vue';
import AssignRequestsDialog from '@/components/requests/AssignRequestsDialog.vue';

export default {
  name: 'RequestAssignment',
  components: {
    RequestAssignmentDialog,
    AssignRequestsDialog: AssignRequestsDialog
  },
  data() {
    return {
      loading: false,
      technicianLoading: false,
      requests: [],
      totalRequests: 0,
      selectedTechnician: null,
      statusFilter: null,
      typeFilter: null,
      searchQuery: '',
      showUnassignedOnly: false,
      debounceTimeout: null,

      assignDialog: false,
      assignMultipleDialog: false,
      selectedRequestId: null,

      requestHeaders: [
        { text: '№', value: 'number', width: '120px' },
        { text: 'Заголовок', value: 'title' },
        { text: 'Тип', value: 'type', width: '100px' },
        { text: 'Статус', value: 'status', width: '100px' },
        { text: 'Исполнитель', value: 'assignedTo', width: '150px' },
        { text: 'Создана', value: 'createdAt', width: '120px' },
        { text: 'Действия', value: 'actions', sortable: false, width: '100px', align: 'center' }
      ]
    };
  },
  computed: {
    ...mapGetters('requests', [
      'allRequestStatuses',
      'allRequestTypes'
    ]),
    ...mapGetters('users', [
      'allTechnicians'
    ]),

    technicianOptions() {
      return this.allTechnicians || [];
    },

    statusOptions() {
      return (this.allRequestStatuses || []).map(status => ({
        text: status.name,
        value: status.id
      }));
    },

    typeOptions() {
      return (this.allRequestTypes || []).map(type => ({
        text: type.name,
        value: type.id
      }));
    },

    filteredRequests() {
      let result = [...this.requests];

      if (this.showUnassignedOnly) {
        result = result.filter(r => !r.assignedTo);
      }

      return result;
    },

    assignedCount() {
      return this.requests.filter(r => r.assignedTo).length;
    },

    unassignedCount() {
      return this.requests.filter(r => !r.assignedTo).length;
    }
  },
  created() {
    this.loadReferenceData();
    this.loadRequests();
  },
  methods: {
    async loadReferenceData() {
      try {
        await Promise.all([
          this.$store.dispatch('users/fetchTechnicians'),
          this.$store.dispatch('requests/fetchRequestStatuses'),
          this.$store.dispatch('requests/fetchRequestTypes')
        ]);
      } catch (error) {
        console.error('Error loading reference data:', error);
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке справочных данных');
      }
    },

    async loadRequests() {
      this.loading = true;

      try {
        const params = {};

        if (this.selectedTechnician) {
          params.assignedToId = this.selectedTechnician.id;
        }

        if (this.statusFilter) {
          params.statusId = this.statusFilter;
        }

        if (this.typeFilter) {
          params.typeId = this.typeFilter;
        }

        if (this.searchQuery) {
          params.search = this.searchQuery;
        }

        params.sortBy = 'createdAt';
        params.order = 'DESC';

        params.limit = 100;

        const response = await this.$store.dispatch('requests/fetchRequests', params);
        this.requests = response.data || [];
        this.totalRequests = response.total || 0;
      } catch (error) {
        console.error('Error loading requests:', error);
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке заявок');
      } finally {
        this.loading = false;
      }
    },

    async loadTechnicianRequests() {
      if (this.selectedTechnician) {
        // Сбрасываем другие фильтры при выборе техника
        this.statusFilter = null;
        this.typeFilter = null;
        this.searchQuery = '';
      }

      await this.loadRequests();
    },

    refreshRequests() {
      this.loadRequests();
    },

    onSearchInput() {
      // Debounce для поиска
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.loadRequests();
      }, 300);
    },

    openAssignDialog(request) {
      this.selectedRequestId = request.id;
      this.assignDialog = true;
    },

    openAssignMultipleDialog() {
      this.assignMultipleDialog = true;
    },

    async onRequestAssigned() {
      // Перезагружаем список заявок
      await this.loadRequests();
    },

    async onMultipleAssigned(data) {
      // Перезагружаем список заявок
      await this.loadRequests();

      // Если был указан техник, обновляем выбранного техника
      if (data && data.technicianId) {
        const technician = this.technicianOptions.find(t => t.id === data.technicianId);
        if (technician) {
          this.selectedTechnician = technician;
        }
      }
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

    getTypeColor(type) {
      if (!type) return 'grey';

      return type.color || 'blue';
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
    }
  }
};
</script>

<style scoped>
.request-assignment-page {
  width: 100%;
}
</style>