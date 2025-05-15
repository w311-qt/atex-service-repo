<template>
  <div class="request-list-view">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Список заявок
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
                    v-model="selectedType"
                    :items="requestTypes"
                    item-text="name"
                    item-value="id"
                    label="Тип заявки"
                    clearable
                    :loading="typesLoading"
                    @change="onFilterChange"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="selectedStatus"
                    :items="requestStatuses"
                    item-text="name"
                    item-value="id"
                    label="Статус"
                    clearable
                    :loading="statusesLoading"
                    @change="onFilterChange"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="selectedPriority"
                    :items="requestPriorities"
                    item-text="name"
                    item-value="id"
                    label="Приоритет"
                    clearable
                    :loading="prioritiesLoading"
                    @change="onFilterChange"
                  ></v-select>
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
                    @click="dialog = true"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Создать заявку
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Таблица заявок -->
              <v-data-table
                :headers="headers"
                :items="requests"
                :loading="loading"
                :server-items-length="totalRequests"
                :options.sync="options"
                :footer-props="{
                  'items-per-page-options': [10, 25, 50]
                }"
                @update:options="onOptionsChange"
              >
                <!-- Форматирование номера заявки -->
                <template v-slot:item.number="{ item }">
                  <a @click.prevent="viewRequest(item.id)" class="text-decoration-none cursor-pointer">
                    {{ item.number }}
                  </a>
                </template>

                <!-- Форматирование типа заявки - получаем имя по id -->
                <template v-slot:item.type="{ item }">
                  {{ getRequestTypeName(item.typeId) }}
                </template>

                <!-- Форматирование статуса заявки - получаем имя по id -->
                <template v-slot:item.status="{ item }">
                  {{ getRequestStatusName(item.statusId) }}
                </template>

                <!-- Форматирование приоритета заявки - только цвет -->
                <template v-slot:item.priority="{ item }">
                  <v-icon
                    :color="getRequestPriorityColor(item.priorityId)"
                    small
                  >
                    mdi-circle
                  </v-icon>
                </template>

                <!-- Форматирование исполнителя -->
                <template v-slot:item.assignedTo="{ item }">
                  <div v-if="item.assignedToId">
                    {{ getUserName(item.assignedToId) }}
                  </div>
                  <div v-else class="grey--text text-caption">
                    Не назначен
                  </div>
                </template>

                <!-- Форматирование дат -->
                <template v-slot:item.createdAt="{ item }">
                  {{ formatDateTime(item.createdAt) }}
                </template>

                <template v-slot:item.completedAt="{ item }">
                  <span v-if="item.completedAt">{{ formatDateTime(item.completedAt) }}</span>
                  <span v-else class="grey--text text-caption">-</span>
                </template>

                <!-- Колонка действий -->
                <template v-slot:item.actions="{ item }">
                  <v-icon
                    small
                    class="mr-2"
                    @click="viewRequest(item.id)"
                  >
                    mdi-eye
                  </v-icon>
                  <v-icon
                    small
                    class="mr-2"
                    @click="editRequest(item)"
                    v-if="canEditRequest(item)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    small
                    class="mr-2"
                    color="success"
                    @click="openCompleteDialog(item)"
                    v-if="canCompleteRequest(item)"
                  >
                    mdi-check
                  </v-icon>
                  <v-icon
                    small
                    class="mr-2"
                    color="orange"
                    @click="openCancelDialog(item)"
                    v-if="canCancelRequest(item)"
                  >
                    mdi-close
                  </v-icon>
                  <v-icon
                    small
                    color="error"
                    @click="confirmDelete(item)"
                    v-if="isAdmin"
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
                      <v-icon large color="grey lighten-1">mdi-clipboard-text-off</v-icon>
                      <div class="subtitle-1 mt-2">Нет данных для отображения</div>
                      <v-btn color="primary" class="mt-2" @click="resetFilters">Сбросить фильтры</v-btn>
                    </div>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Диалоги -->
    <request-create-dialog
      :dialog="dialog"
      @close="dialog = false"
      @saved="onRequestSaved"
    />

    <request-edit-dialog
      v-if="selectedRequest"
      :request="selectedRequest"
      @close="selectedRequest = null"
      @updated="onRequestSaved"
    />

    <!-- Диалог завершения заявки -->
    <v-dialog v-model="completeDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Завершение заявки</v-card-title>
        <v-card-text>
          <p>Вы собираетесь завершить заявку "{{ completeItem ? completeItem.number : '' }}"</p>
          <v-textarea
            v-model="completeComment"
            label="Комментарий о выполнении"
            rows="3"
            placeholder="Опишите, как была выполнена заявка..."
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="completeDialog = false">Отмена</v-btn>
          <v-btn
            color="success"
            text
            @click="completeRequest"
            :loading="actionLoading"
          >
            Завершить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог отмены заявки -->
    <v-dialog v-model="cancelDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Отмена заявки</v-card-title>
        <v-card-text>
          <p>Вы собираетесь отменить заявку "{{ cancelItem ? cancelItem.number : '' }}"</p>
          <v-textarea
            v-model="cancelReason"
            label="Причина отмены"
            rows="3"
            placeholder="Укажите причину отмены заявки..."
            :rules="[v => !!v || 'Необходимо указать причину отмены']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="cancelDialog = false">Отмена</v-btn>
          <v-btn
            color="orange"
            text
            @click="cancelRequest"
            :loading="actionLoading"
            :disabled="!cancelReason"
          >
            Отменить заявку
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Подтвердите удаление</v-card-title>
        <v-card-text>
          Вы действительно хотите удалить заявку "{{ deleteItem ? deleteItem.number : '' }}"?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="red darken-1" text @click="deleteRequest" :loading="deleteLoading">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import RequestCreateDialog from '@/components/requests/RequestCreateDialog.vue';
import RequestEditDialog from '@/components/requests/ReuestEditDialog.vue';

export default {
  name: 'RequestListView',

  components: {
    RequestCreateDialog,
    RequestEditDialog
  },

  data() {
    return {
      search: '',
      selectedType: null,
      selectedStatus: null,
      selectedPriority: null,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['createdAt'],
        sortDesc: [true]
      },
      headers: [
        { text: '№ заявки', value: 'number', sortable: true },
        { text: 'Тема', value: 'title', sortable: true },
        { text: 'Тип', value: 'type', sortable: false },
        { text: 'Статус', value: 'status', sortable: false },
        { text: 'Приоритет', value: 'priority', sortable: false, align: 'center', width: '100px' },
        { text: 'Исполнитель', value: 'assignedTo', sortable: false },
        { text: 'Создана', value: 'createdAt', sortable: true },
        { text: 'Завершена', value: 'completedAt', sortable: true },
        { text: 'Действия', value: 'actions', sortable: false, align: 'center', width: '180px' }
      ],
      dialog: false,
      selectedRequest: null,

      // Диалог завершения
      completeDialog: false,
      completeItem: null,
      completeComment: '',

      // Диалог отмены
      cancelDialog: false,
      cancelItem: null,
      cancelReason: '',

      // Диалог удаления
      deleteDialog: false,
      deleteItem: null,
      deleteLoading: false,

      // Общий индикатор загрузки для действий
      actionLoading: false,

      // Состояние загрузки
      loading: false,
      typesLoading: false,
      statusesLoading: false,
      prioritiesLoading: false,
      error: null,

      // Дебаунс для поиска
      debounceTimeout: null
    };
  },

  computed: {
    ...mapGetters('auth', [
      'isAdmin',
      'isTechnician',
      'currentUser'
    ]),

    ...mapGetters('requests', [
      'allRequestTypes',
      'allRequestStatuses',
      'allRequestPriorities'
    ]),

    ...mapGetters('users', [
      'allUsers'
    ]),

    totalRequests() {
      return this.$store.state.requests?.totalRequests || 0;
    },

    requests() {
      return this.$store.state.requests?.requestsList || [];
    },

    requestTypes() {
      return this.allRequestTypes || [];
    },

    requestStatuses() {
      return this.allRequestStatuses || [];
    },

    requestPriorities() {
      return this.allRequestPriorities || [];
    }
  },

  created() {
    this.fetchRequests();
    this.loadFilters();
  },

  methods: {
    async loadFilters() {
      try {
        await Promise.all([
          this.loadRequestTypes(),
          this.loadRequestStatuses(),
          this.loadRequestPriorities()
        ]);
      } catch (error) {
        console.error('Error loading filters:', error);
        this.error = 'Ошибка при загрузке фильтров';
      }
    },

    async loadRequestTypes() {
      this.typesLoading = true;
      try {
        await this.$store.dispatch('requests/fetchRequestTypes');
      } catch (error) {
        console.error('Error loading request types:', error);
      } finally {
        this.typesLoading = false;
      }
    },

    async loadRequestStatuses() {
      this.statusesLoading = true;
      try {
        await this.$store.dispatch('requests/fetchRequestStatuses');
      } catch (error) {
        console.error('Error loading request statuses:', error);
      } finally {
        this.statusesLoading = false;
      }
    },

    async loadRequestPriorities() {
      this.prioritiesLoading = true;
      try {
        await this.$store.dispatch('requests/fetchRequestPriorities');
      } catch (error) {
        console.error('Error loading request priorities:', error);
      } finally {
        this.prioritiesLoading = false;
      }
    },

    async fetchRequests() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.options.sortBy.length ? this.options.sortBy[0] : 'createdAt',
          order: this.options.sortDesc.length && this.options.sortDesc[0] ? 'DESC' : 'ASC',
          search: this.search,
          typeId: this.selectedType,
          statusId: this.selectedStatus,
          priorityId: this.selectedPriority
        };

        await this.$store.dispatch('requests/fetchRequests', params);
      } catch (error) {
        console.error('Error fetching requests:', error);
        this.error = 'Ошибка при загрузке списка заявок';
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      // Debounce для поиска
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.options.page = 1;
        this.fetchRequests();
      }, 300);
    },

    onFilterChange() {
      this.options.page = 1;
      this.fetchRequests();
    },

    onOptionsChange() {
      this.fetchRequests();
    },

    resetFilters() {
      this.search = '';
      this.selectedType = null;
      this.selectedStatus = null;
      this.selectedPriority = null;
      this.options.page = 1;
      this.fetchRequests();
    },

    viewRequest(id) {
      this.$router.push(`/requests/${id}`);
    },

    editRequest(request) {
      this.selectedRequest = request;
    },

    openCompleteDialog(request) {
      this.completeItem = request;
      this.completeComment = '';
      this.completeDialog = true;
    },

    openCancelDialog(request) {
      this.cancelItem = request;
      this.cancelReason = '';
      this.cancelDialog = true;
    },

    confirmDelete(request) {
      this.deleteItem = request;
      this.deleteDialog = true;
    },

    async completeRequest() {
      if (!this.completeItem) return;

      this.actionLoading = true;
      try {
        await this.$store.dispatch('requests/completeRequest', {
          id: this.completeItem.id,
          resolutionComment: this.completeComment
        });

        this.$store.commit('notification/SHOW_SUCCESS', 'Заявка успешно завершена');
        this.completeDialog = false;
        this.completeItem = null;
        this.fetchRequests();
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при завершении заявки');
      } finally {
        this.actionLoading = false;
      }
    },

    async cancelRequest() {
      if (!this.cancelItem || !this.cancelReason) return;

      this.actionLoading = true;
      try {
        await this.$store.dispatch('requests/cancelRequest', {
          id: this.cancelItem.id,
          reason: this.cancelReason
        });

        this.$store.commit('notification/SHOW_SUCCESS', 'Заявка отменена');
        this.cancelDialog = false;
        this.cancelItem = null;
        this.fetchRequests();
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при отмене заявки');
      } finally {
        this.actionLoading = false;
      }
    },

    async deleteRequest() {
      if (!this.deleteItem) return;

      this.deleteLoading = true;
      try {
        await this.$store.dispatch('requests/deleteRequest', this.deleteItem.id);
        this.$store.commit('notification/SHOW_SUCCESS', 'Заявка успешно удалена');
        this.deleteDialog = false;
        this.deleteItem = null;
        this.fetchRequests();
      } catch (error) {
        this.error = 'Ошибка при удалении заявки';
        console.error('Error deleting request:', error);
      } finally {
        this.deleteLoading = false;
      }
    },

    onRequestSaved() {
      this.dialog = false;
      this.selectedRequest = null;
      this.fetchRequests();
      this.$store.commit('notification/SHOW_SUCCESS', 'Заявка успешно сохранена');
    },

    formatDateTime(dateString) {
      if (!dateString) return '-';

      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (e) {
        return '-';
      }
    },

    // Методы для получения данных по id
    getRequestTypeName(typeId) {
      if (!typeId) return 'Не указан';
      const type = this.requestTypes.find(t => t.id === typeId);
      return type ? type.name : 'Не указан';
    },

    getRequestStatusName(statusId) {
      if (!statusId) return 'Не указан';
      const status = this.requestStatuses.find(s => s.id === statusId);
      return status ? status.name : 'Не указан';
    },

    getRequestPriorityColor(priorityId) {
      if (!priorityId) return 'grey';
      const priority = this.requestPriorities.find(p => p.id === priorityId);
      return priority ? priority.color || 'blue' : 'grey';
    },

    getUserName(userId) {
      if (!userId) return 'Не назначен';
      // Если у нас есть список всех пользователей
      if (this.allUsers) {
        const user = this.allUsers.find(u => u.id === userId);
        return user ? user.name : 'Не указан';
      }
      // Иначе можно вернуть данные из связанного объекта
      const request = this.requests.find(r => r.assignedToId === userId);
      return request && request.assignedTo ? request.assignedTo.name : 'Не указан';
    },

    canEditRequest(request) {
      if (!request || !this.currentUser) return false;

      // Администраторы могут редактировать все заявки
      if (this.isAdmin) return true;

      // Техники могут редактировать назначенные им заявки
      if (this.isTechnician && request.assignedToId === this.currentUser.id) return true;

      // Пользователи могут редактировать свои заявки, если они не назначены технику
      if (request.createdById === this.currentUser.id && !request.assignedToId) return true;

      return false;
    },

    canCompleteRequest(request) {
      if (!request || !this.currentUser) return false;

      // Определяем статус через полученное имя по id
      const statusName = this.getRequestStatusName(request.statusId);

      // Нельзя завершить уже завершенную или отмененную заявку
      if (statusName === 'Выполнена' || statusName === 'Отменена') {
        return false;
      }

      // Администраторы могут завершать любые заявки
      if (this.isAdmin) return true;

      // Техники могут завершать назначенные им заявки
      if (this.isTechnician && request.assignedToId === this.currentUser.id) return true;

      return false;
    },

    canCancelRequest(request) {
      if (!request || !this.currentUser) return false;

      // Определяем статус через полученное имя по id
      const statusName = this.getRequestStatusName(request.statusId);

      // Нельзя отменить уже завершенную или отмененную заявку
      if (statusName === 'Выполнена' || statusName === 'Отменена') {
        return false;
      }

      // Администраторы могут отменять любые заявки
      if (this.isAdmin) return true;

      // Техники могут отменять назначенные им заявки
      if (this.isTechnician && request.assignedToId === this.currentUser.id) return true;

      // Пользователи могут отменять свои заявки
      if (request.createdById === this.currentUser.id) return true;

      return false;
    }
  }
}
</script>

<style scoped>
.request-list-view {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}
</style>