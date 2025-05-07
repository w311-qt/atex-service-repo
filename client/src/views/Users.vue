<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Управление пользователями</h1>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="createUser"
        >
          <v-icon left>mdi-account-plus</v-icon>
          Добавить пользователя
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
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.search"
              label="Поиск"
              prepend-icon="mdi-magnify"
              clearable
              @input="applyFilters"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.role"
              :items="roles"
              label="Роль"
              prepend-icon="mdi-shield-account"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.status"
              :items="statuses"
              label="Статус"
              prepend-icon="mdi-account-check"
              clearable
              @change="applyFilters"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Таблица пользователей -->
    <v-card outlined>
      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        :server-items-length="totalUsers"
        :options.sync="options"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100],
          'show-current-page': true,
          'show-first-last-page': true
        }"
        @update:options="fetchUsers"
        class="user-table"
      >
        <template v-slot:item.avatar="{ item }">
          <v-avatar
            :color="getAvatarColor(item)"
            size="36"
          >
            <span class="white--text">{{ getUserInitials(item) }}</span>
          </v-avatar>
        </template>

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
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="primary"
                v-bind="attrs"
                v-on="on"
                @click="editUser(item)"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Редактировать</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                :color="item.isActive ? 'error' : 'success'"
                v-bind="attrs"
                v-on="on"
                @click="toggleUserStatus(item)"
              >
                <v-icon small>{{ item.isActive ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ item.isActive ? 'Деактивировать' : 'Активировать' }}</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                color="warning"
                v-bind="attrs"
                v-on="on"
                @click="resetPassword(item)"
              >
                <v-icon small>mdi-lock-reset</v-icon>
              </v-btn>
            </template>
            <span>Сбросить пароль</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
      v-model="dialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditing ? 'Редактирование пользователя' : 'Создание пользователя' }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.name"
                    :rules="nameRules"
                    label="ФИО*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.email"
                    :rules="emailRules"
                    label="Email*"
                    required
                    :disabled="isEditing"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.department"
                    label="Отдел"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.position"
                    label="Должность"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="formData.role"
                    :items="roles"
                    :rules="roleRules"
                    label="Роль*"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" v-if="!isEditing">
                  <v-text-field
                    v-model="formData.password"
                    :rules="passwordRules"
                    label="Пароль*"
                    type="password"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-switch
                    v-model="formData.isActive"
                    label="Активен"
                    color="success"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
          <small>*обязательные поля</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Отмена</v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveUser"
            :disabled="!valid || loading"
            :loading="loading"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="resetDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Сброс пароля</span>
        </v-card-title>
        <v-card-text>
          <p class="mb-3">Вы собираетесь сбросить пароль для пользователя <strong>{{ selectedUser ? selectedUser.name : '' }}</strong>.</p>
          <v-form ref="resetForm" v-model="resetValid" lazy-validation>
            <v-text-field
              v-model="resetData.password"
              :rules="passwordRules"
              label="Новый пароль*"
              type="password"
              required
            ></v-text-field>
            <v-text-field
              v-model="resetData.confirmPassword"
              :rules="confirmPasswordRules"
              label="Подтверждение пароля*"
              type="password"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="resetDialog = false">Отмена</v-btn>
          <v-btn
            color="red darken-1"
            text
            @click="confirmResetPassword"
            :disabled="!resetValid || resetLoading"
            :loading="resetLoading"
          >
            Сбросить пароль
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="statusDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ selectedUser && selectedUser.isActive ? 'Деактивация пользователя' : 'Активация пользователя' }}</span>
        </v-card-title>
        <v-card-text>
          <p v-if="selectedUser && selectedUser.isActive">
            Вы собираетесь деактивировать пользователя <strong>{{ selectedUser.name }}</strong>.
            После деактивации пользователь не сможет входить в систему.
          </p>
          <p v-else-if="selectedUser">
            Вы собираетесь активировать пользователя <strong>{{ selectedUser.name }}</strong>.
            После активации пользователь сможет входить в систему.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="statusDialog = false">Отмена</v-btn>
          <v-btn
            :color="selectedUser && selectedUser.isActive ? 'red darken-1' : 'green darken-1'"
            text
            @click="confirmToggleStatus"
            :loading="statusLoading"
          >
            {{ selectedUser && selectedUser.isActive ? 'Деактивировать' : 'Активировать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import debounce from 'lodash/debounce';

export default {
  name: 'UsersView',
  data() {
    return {
      loading: false,
      users: [],
      totalUsers: 0,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['name'],
        sortDesc: [false]
      },
      headers: [
        { text: '', value: 'avatar', sortable: false, width: '60px' },
        { text: 'ФИО', value: 'name', sortable: true },
        { text: 'Email', value: 'email', sortable: true },
        { text: 'Роль', value: 'role', sortable: true, width: '120px' },
        { text: 'Отдел', value: 'department', sortable: true },
        { text: 'Должность', value: 'position', sortable: true },
        { text: 'Статус', value: 'isActive', sortable: true, width: '120px' },
        { text: 'Дата регистрации', value: 'createdAt', sortable: true, width: '150px' },
        { text: 'Действия', value: 'actions', sortable: false, width: '150px', align: 'center' }
      ],
      filters: {
        search: '',
        role: null,
        status: null
      },
      roles: [
        { text: 'Администратор', value: 'admin' },
        { text: 'Техник', value: 'technician' },
        { text: 'Пользователь', value: 'user' }
      ],
      statuses: [
        { text: 'Активен', value: true },
        { text: 'Неактивен', value: false }
      ],
      dialog: false,
      isEditing: false,
      valid: true,
      formData: {
        name: '',
        email: '',
        department: '',
        position: '',
        role: 'user',
        password: '',
        isActive: true
      },
      selectedUser: null,
      nameRules: [
        v => !!v || 'ФИО обязательно',
        v => (v && v.length >= 3) || 'ФИО должно содержать минимум 3 символа'
      ],
      emailRules: [
        v => !!v || 'Email обязателен',
        v => /.+@.+\..+/.test(v) || 'Email должен быть корректным'
      ],
      roleRules: [
        v => !!v || 'Роль обязательна'
      ],
      passwordRules: [
        v => !!v || 'Пароль обязателен',
        v => (v && v.length >= 6) || 'Пароль должен содержать минимум 6 символов'
      ],
      resetDialog: false,
      resetValid: true,
      resetLoading: false,
      resetData: {
        password: '',
        confirmPassword: ''
      },
      confirmPasswordRules: [
        v => !!v || 'Подтверждение пароля обязательно',
        v => v === this.resetData.password || 'Пароли не совпадают'
      ],
      statusDialog: false,
      statusLoading: false
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isAdmin'
    ])
  },
  created() {
    // Используем debounce для фильтрации, чтобы избежать частых запросов при вводе текста
    this.debouncedFilter = debounce(this.fetchUsers, 300);
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      if (!this.isAdmin) {
        this.$router.push('/');
        return;
      }

      this.loading = true;

      try {
        const { page, itemsPerPage, sortBy, sortDesc } = this.options;

        // Формируем параметры для API запроса
        const params = {
          page,
          limit: itemsPerPage,
          sortBy: sortBy[0] || 'name',
          order: sortDesc[0] ? 'DESC' : 'ASC',
          search: this.filters.search || undefined,
          role: this.filters.role || undefined,
          isActive: this.filters.status === null ? undefined : this.filters.status
        };

        // Делаем запрос к API
        const response = await this.$store.dispatch('users/fetchUsers', params);

        this.users = response.data;
        this.totalUsers = response.total;
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке списка пользователей');
      } finally {
        this.loading = false;
      }
    },

    applyFilters() {
      this.options.page = 1; // Сбрасываем на первую страницу
      this.debouncedFilter();
    },

    getUserInitials(user) {
      if (!user || !user.name) return '';

      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`;
      }
      return user.name[0] || '';
    },

    getAvatarColor(user) {
      // Простая функция для определения цвета аватара на основе роли пользователя
      if (!user) return 'grey';

      const roleColors = {
        admin: 'purple',
        technician: 'blue',
        user: 'teal'
      };

      return roleColors[user.role] || 'grey';
    },

    getRoleName(role) {
      const roleNames = {
        admin: 'Администратор',
        technician: 'Техник',
        user: 'Пользователь'
      };

      return roleNames[role] || role;
    },

    getRoleColor(role) {
      const roleColors = {
        admin: 'purple',
        technician: 'blue',
        user: 'teal'
      };

      return roleColors[role] || 'grey';
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

    createUser() {
      this.isEditing = false;
      this.formData = {
        name: '',
        email: '',
        department: '',
        position: '',
        role: 'user',
        password: '',
        isActive: true
      };
      this.dialog = true;
    },

    editUser(user) {
      this.isEditing = true;
      this.selectedUser = user;
      this.formData = {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department || '',
        position: user.position || '',
        role: user.role,
        isActive: user.isActive
      };
      this.dialog = true;
    },

    async saveUser() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;

      try {
        if (this.isEditing) {
          // Обновление пользователя
          await this.$store.dispatch('users/updateUser', {
            id: this.formData.id,
            userData: {
              name: this.formData.name,
              department: this.formData.department,
              position: this.formData.position,
              role: this.formData.role,
              isActive: this.formData.isActive
            }
          });
          this.$store.commit('notification/SHOW_SUCCESS', 'Пользователь успешно обновлен');
        } else {
          // Создание пользователя
          await this.$store.dispatch('users/createUser', this.formData);
          this.$store.commit('notification/SHOW_SUCCESS', 'Пользователь успешно создан');
        }

        this.closeDialog();
        this.fetchUsers();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка при сохранении пользователя';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.loading = false;
      }
    },

    closeDialog() {
      this.dialog = false;
      this.selectedUser = null;
      this.$refs.form.resetValidation();
    },

    resetPassword(user) {
      this.selectedUser = user;
      this.resetData = {
        password: '',
        confirmPassword: ''
      };
      this.resetDialog = true;
    },

    async confirmResetPassword() {
      if (!this.$refs.resetForm.validate()) return;

      this.resetLoading = true;

      try {
        await this.$store.dispatch('users/resetPassword', {
          id: this.selectedUser.id,
          password: this.resetData.password
        });

        this.$store.commit('notification/SHOW_SUCCESS', 'Пароль успешно сброшен');
        this.resetDialog = false;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка при сбросе пароля';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.resetLoading = false;
      }
    },

    toggleUserStatus(user) {
      this.selectedUser = user;
      this.statusDialog = true;
    },

    async confirmToggleStatus() {
      this.statusLoading = true;

      try {
        await this.$store.dispatch('users/toggleUserStatus', {
          id: this.selectedUser.id,
          isActive: !this.selectedUser.isActive
        });

        const statusText = this.selectedUser.isActive ? 'деактивирован' : 'активирован';
        this.$store.commit('notification/SHOW_SUCCESS', `Пользователь успешно ${statusText}`);

        this.statusDialog = false;
        this.fetchUsers();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ошибка при изменении статуса пользователя';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.statusLoading = false;
      }
    }
  },
  beforeDestroy() {
    this.debouncedFilter.cancel();
  }
};
</script>

<style scoped>
.user-table {
  width: 100%;
}
</style>