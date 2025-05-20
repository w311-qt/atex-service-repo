<template>
  <div class="users-page">
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Управление пользователями</h1>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="openCreateDialog"
        >
          <v-icon left>mdi-plus</v-icon>
          Добавить пользователя
        </v-btn>
      </v-card-title>
    </v-card>

    <v-row>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Поиск"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-select
              v-model="roleFilter"
              :items="roleOptions"
              label="Роль"
              hide-details
              class="ml-2"
              style="max-width: 150px;"
              clearable
            ></v-select>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :search="search"
            :loading="loading"
            sort-by="name"
            class="elevation-0"
          >
            <template v-slot:item.role="{ item }">
              <v-chip
                small
                :color="getRoleColor(item.role)"
                text-color="white"
              >
                {{ getRoleName(item.role) }}
              </v-chip>
            </template>

            <template v-slot:item.isActive="{ item }">
              <v-chip
                small
                :color="item.isActive ? 'success' : 'error'"
                text-color="white"
              >
                {{ item.isActive ? 'Активен' : 'Неактивен' }}
              </v-chip>
            </template>

            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                small
                color="primary"
                @click="editUser(item)"
                class="mr-2"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                color="warning"
                @click="toggleUserStatus(item)"
                class="mr-2"
                v-if="item.id !== currentUserId"
              >
                <v-icon small>{{ item.isActive ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                color="info"
                @click="viewUserRequests(item)"
                v-if="item.role === 'technician' || item.role === 'user'"
                class="mr-2"
              >
                <v-icon small>mdi-clipboard-text</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                color="blue"
                @click="assignRequests(item)"
                v-if="item.role === 'technician' && item.isActive"
              >
                <v-icon small>mdi-clipboard-plus</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Модальные окна -->
    <user-form
      :dialog="userDialog"
      :edit-mode="editMode"
      :user="selectedUser"
      @close="userDialog = false"
      @saved="fetchUsers"
    />

    <v-dialog v-model="assignDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Назначение заявок пользователю {{ selectedUser ? selectedUser.name : '' }}</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedRequests"
            :items="availableRequests"
            item-text="displayText"
            item-value="id"
            label="Выберите заявки"
            multiple
            chips
            :loading="requestsLoading"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="assignDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!selectedRequests.length || assigningRequests"
            :loading="assigningRequests"
            @click="confirmAssignRequests"
          >
            Назначить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">
          {{ dialogTitle }}
        </v-card-title>
        <v-card-text>
          {{ dialogText }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="confirmDialog = false">Отмена</v-btn>
          <v-btn
            :color="dialogAction === 'deactivate' ? 'error' : 'success'"
            text
            @click="confirmAction"
            :loading="confirmLoading"
          >
            {{ dialogAction === 'deactivate' ? 'Деактивировать' : 'Активировать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="userRequestsDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Заявки пользователя {{ selectedUser ? selectedUser.name : '' }}</span>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="requestHeaders"
            :items="userRequests"
            :loading="requestsLoading"
            sort-by="createdAt"
            sort-desc
            class="elevation-0"
          >
            <template v-slot:item.number="{ item }">
              <router-link :to="`/requests/${item.id}`">{{ item.number }}</router-link>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                small
                :color="getStatusColor(item.status)"
                text-color="white"
              >
                {{ item.status ? item.status.name : 'Не указан' }}
              </v-chip>
            </template>

            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <template v-slot:no-data>
              <div class="text-center py-3">
                <v-icon large color="grey lighten-1">mdi-clipboard-text-off</v-icon>
                <p class="mt-2 grey--text">У пользователя нет заявок</p>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="userRequestsDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import UserForm from '@/components/users/UserForm.vue';

export default {
  name: 'Users',
  components: {
    UserForm
  },
  data() {
    return {
      search: '',
      roleFilter: null,
      loading: false,
      userDialog: false,
      editMode: false,
      selectedUser: null,
      confirmDialog: false,
      dialogTitle: '',
      dialogText: '',
      dialogAction: '',
      confirmLoading: false,
      assignDialog: false,
      selectedRequests: [],
      requestsLoading: false,
      assigningRequests: false,
      userRequestsDialog: false,
      userRequests: [],
      headers: [
        { text: 'ФИО', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Роль', value: 'role' },
        { text: 'Отдел', value: 'department' },
        { text: 'Должность', value: 'position' },
        { text: 'Статус', value: 'isActive' },
        { text: 'Дата регистрации', value: 'createdAt' },
        { text: 'Действия', value: 'actions', sortable: false }
      ],
      requestHeaders: [
        { text: '№ заявки', value: 'number' },
        { text: 'Тема', value: 'title' },
        { text: 'Статус', value: 'status' },
        { text: 'Создана', value: 'createdAt' }
      ],
      roleOptions: [
        { text: 'Администратор', value: 'admin' },
        { text: 'Техник', value: 'technician' },
        { text: 'Пользователь', value: 'user' }
      ],
      availableRequests: []
    };
  },
  computed: {
    ...mapGetters('auth', [
      'currentUser'
    ]),
    currentUserId() {
      return this.currentUser?.id || '';
    },
    users() {
      return this.$store.state.users?.users || [];
    },
    filteredUsers() {
      if (!this.roleFilter) {
        return this.users;
      }
      return this.users.filter(user => user.role === this.roleFilter);
    }
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        await this.$store.dispatch('users/fetchUsers');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке пользователей');
      } finally {
        this.loading = false;
      }
    },

    openCreateDialog() {
      this.editMode = false;
      this.selectedUser = null;
      this.userDialog = true;
    },

    editUser(user) {
      this.editMode = true;
      this.selectedUser = user;
      this.userDialog = true;
    },

    toggleUserStatus(user) {
      this.selectedUser = user;
      this.dialogAction = user.isActive ? 'deactivate' : 'activate';
      this.dialogTitle = user.isActive ? 'Деактивация пользователя' : 'Активация пользователя';
      this.dialogText = user.isActive
        ? `Вы действительно хотите деактивировать пользователя ${user.name}? Он больше не сможет авторизоваться в системе.`
        : `Вы действительно хотите активировать пользователя ${user.name}?`;
      this.confirmDialog = true;
    },

    async confirmAction() {
      this.confirmLoading = true;
      try {
        await this.$store.dispatch('users/toggleUserStatus', {
          id: this.selectedUser.id,
          isActive: this.dialogAction === 'activate'
        });

        const message = this.dialogAction === 'activate'
          ? 'Пользователь успешно активирован'
          : 'Пользователь успешно деактивирован';
        this.$store.commit('notification/SHOW_SUCCESS', message);

        this.confirmDialog = false;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка при изменении статуса пользователя';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.confirmLoading = false;
      }
    },

    async viewUserRequests(user) {
      this.selectedUser = user;
      this.requestsLoading = true;
      this.userRequests = [];
      this.userRequestsDialog = true;

      try {
        const params = user.role === 'technician'
          ? { assignedToId: user.id }
          : { createdById: user.id };

        const response = await this.$store.dispatch('requests/fetchRequests', params);
        this.userRequests = response.data || [];
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке заявок пользователя');
      } finally {
        this.requestsLoading = false;
      }
    },

    async assignRequests(user) {
      this.selectedUser = user;
      this.selectedRequests = [];
      this.assignDialog = true;
      this.requestsLoading = true;

      try {
        const response = await this.$store.dispatch('requests/fetchRequests', {
          statusId: null,
          assignedToId: 'unassigned'
        });

        this.availableRequests = (response.data || []).map(request => ({
          id: request.id,
          displayText: `${request.number} - ${request.title}`,
          request
        }));
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке доступных заявок');
      } finally {
        this.requestsLoading = false;
      }
    },

    async confirmAssignRequests() {
      if (!this.selectedRequests.length) return;

      this.assigningRequests = true;
      let successCount = 0;
      let errorCount = 0;

      try {
        const promises = this.selectedRequests.map(requestId =>
          this.$store.dispatch('requests/assignRequest', {
            id: requestId,
            userId: this.selectedUser.id,
            comment: `Заявка назначена пользователю ${this.selectedUser.name}`
          })
        );

        const results = await Promise.allSettled(promises);

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            // eslint-disable-next-line no-const-assign
            successCount++;
          } else {
            errorCount++;
          }
        });

        if (successCount > 0) {
          this.$store.commit('notification/SHOW_SUCCESS',
            `Успешно назначено заявок: ${successCount}${errorCount > 0 ? `, не удалось назначить: ${errorCount}` : ''}`
          );
        } else if (errorCount > 0) {
          this.$store.commit('notification/SHOW_ERROR', 'Не удалось назначить заявки');
        }

        this.assignDialog = false;
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при назначении заявок');
      } finally {
        this.assigningRequests = false;
      }
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

    getRoleName(role) {
      const roleMap = {
        'admin': 'Администратор',
        'technician': 'Техник',
        'user': 'Пользователь'
      };

      return roleMap[role] || role;
    },

    getRoleColor(role) {
      const roleColorMap = {
        'admin': 'purple',
        'technician': 'indigo',
        'user': 'primary'
      };

      return roleColorMap[role] || 'grey';
    },

    getStatusColor(status) {
      if (!status) return 'grey';

      const statusColorMap = {
        'Новая': 'info',
        'В работе': 'primary',
        'Ожидает': 'warning',
        'Выполнена': 'success',
        'Отменена': 'error'
      };

      return statusColorMap[status.name] || status.color || 'grey';
    }
  }
};
</script>

<style scoped>
.users-page {
  width: 100%;
}
</style>