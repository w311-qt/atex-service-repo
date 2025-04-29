<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Профиль пользователя</h1>
      </v-card-title>
    </v-card>

    <v-row>
      <v-col cols="12" md="4">
        <!-- Карточка с основной информацией о пользователе -->
        <v-card outlined class="mb-4">
          <v-card-text class="text-center pa-6">
            <v-avatar size="120" color="primary" class="mb-4">
              <span class="white--text text-h4">{{ userInitials }}</span>
            </v-avatar>
            <h2 class="text-h5 mb-2">{{ user.name }}</h2>
            <div class="subtitle-1 grey--text mb-4">{{ roleName }}</div>
            <v-chip
              :color="user.isActive ? 'success' : 'error'"
              text-color="white"
              small
            >
              {{ user.isActive ? 'Активен' : 'Неактивен' }}
            </v-chip>
          </v-card-text>
        </v-card>

        <!-- Карточка с рабочей информацией -->
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-briefcase</v-icon>
            Рабочая информация
          </v-card-title>
          <v-card-text class="pa-4">
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle class="text-caption grey--text">Отдел</v-list-item-subtitle>
                <v-list-item-title>{{ user.department || 'Не указан' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle class="text-caption grey--text">Должность</v-list-item-subtitle>
                <v-list-item-title>{{ user.position || 'Не указана' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle class="text-caption grey--text">Роль в системе</v-list-item-subtitle>
                <v-list-item-title>{{ roleName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <!-- Форма редактирования профиля -->
        <v-card outlined class="mb-4">
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-account-edit</v-icon>
            Редактирование профиля
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    :rules="nameRules"
                    label="ФИО"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.email"
                    :rules="emailRules"
                    label="Email"
                    required
                    disabled
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.department"
                    label="Отдел"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.position"
                    label="Должность"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-btn
                color="primary"
                @click="updateProfile"
                :loading="loading"
                :disabled="!valid || loading"
              >
                Сохранить изменения
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Форма изменения пароля -->
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-lock</v-icon>
            Изменение пароля
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form ref="passwordForm" v-model="passwordValid" lazy-validation>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordData.currentPassword"
                    :rules="passwordRules"
                    label="Текущий пароль"
                    type="password"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordData.newPassword"
                    :rules="newPasswordRules"
                    label="Новый пароль"
                    type="password"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="passwordData.confirmPassword"
                    :rules="confirmPasswordRules"
                    label="Подтверждение нового пароля"
                    type="password"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-btn
                color="primary"
                @click="changePassword"
                :loading="passwordLoading"
                :disabled="!passwordValid || passwordLoading"
              >
                Изменить пароль
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Profile',
  data() {
    return {
      valid: true,
      passwordValid: true,
      loading: false,
      passwordLoading: false,
      formData: {
        name: '',
        email: '',
        department: '',
        position: ''
      },
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      nameRules: [
        v => !!v || 'ФИО обязательно',
        v => (v && v.length >= 3) || 'ФИО должно содержать минимум 3 символа'
      ],
      emailRules: [
        v => !!v || 'Email обязателен',
        v => /.+@.+\..+/.test(v) || 'Email должен быть корректным'
      ],
      passwordRules: [
        v => !!v || 'Пароль обязателен'
      ],
      newPasswordRules: [
        v => !!v || 'Новый пароль обязателен',
        v => (v && v.length >= 6) || 'Пароль должен содержать минимум 6 символов'
      ],
      confirmPasswordRules: [
        v => !!v || 'Подтверждение пароля обязательно',
        v => v === this.passwordData.newPassword || 'Пароли не совпадают'
      ]
    };
  },
  computed: {
    ...mapGetters('auth', [
      'currentUser',
      'isAdmin',
      'isTechnician',
      'isUser'
    ]),
    user() {
      return this.currentUser || {};
    },
    userInitials() {
      if (!this.user.name) return '';

      const parts = this.user.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`;
      }
      return this.user.name[0] || '';
    },
    roleName() {
      if (this.isAdmin) return 'Администратор';
      if (this.isTechnician) return 'Техник';
      if (this.isUser) return 'Пользователь';
      return 'Не определена';
    }
  },
  created() {
    this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        // Если данных пользователя нет в хранилище, запрашиваем их
        if (!this.user.id) {
          await this.$store.dispatch('auth/fetchCurrentUser');
        }

        // Заполняем форму данными пользователя
        this.formData = {
          name: this.user.name || '',
          email: this.user.email || '',
          department: this.user.department || '',
          position: this.user.position || ''
        };
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке профиля');
      }
    },

    async updateProfile() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      try {
        await this.$store.dispatch('auth/updateProfile', this.formData);
        this.$store.commit('notification/SHOW_SUCCESS', 'Профиль успешно обновлен');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR',
          error.response?.data?.message || 'Ошибка при обновлении профиля'
        );
      } finally {
        this.loading = false;
      }
    },

    async changePassword() {
      if (!this.$refs.passwordForm.validate()) return;

      this.passwordLoading = true;
      try {
        await this.$store.dispatch('auth/changePassword', {
          currentPassword: this.passwordData.currentPassword,
          newPassword: this.passwordData.newPassword
        });

        // Очищаем форму после успешного изменения
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        this.$store.commit('notification/SHOW_SUCCESS', 'Пароль успешно изменен');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR',
          error.response?.data?.message || 'Ошибка при изменении пароля'
        );
      } finally {
        this.passwordLoading = false;
      }
    }
  }
};
</script>