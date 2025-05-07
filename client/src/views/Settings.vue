<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Настройки системы</h1>
      </v-card-title>
    </v-card>

    <v-row>
      <v-col cols="12" md="3">
        <v-card outlined>
          <v-list
            nav
            dense
          >
            <v-list-item-group
              v-model="selectedTab"
              color="primary"
            >
              <v-list-item
                v-for="(item, i) in tabs"
                :key="i"
                :value="i"
              >
                <v-list-item-icon>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card
          v-if="selectedTab === 0"
          outlined
        >
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-cog</v-icon>
            Основные настройки
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form ref="generalForm" v-model="generalValid">
              <v-text-field
                v-model="generalSettings.companyName"
                label="Название компании"
                :rules="[v => !!v || 'Название компании обязательно']"
                required
              ></v-text-field>

              <v-text-field
                v-model="generalSettings.contactEmail"
                label="Контактный email"
                :rules="[
                  v => !!v || 'Email обязателен',
                  v => /.+@.+\..+/.test(v) || 'Email должен быть корректным'
                ]"
                required
              ></v-text-field>

              <v-select
                v-model="generalSettings.defaultPagination"
                :items="paginationOptions"
                label="Записей на странице по умолчанию"
                :rules="[v => !!v || 'Выберите значение']"
              ></v-select>

              <v-select
                v-model="generalSettings.defaultLanguage"
                :items="languageOptions"
                label="Язык по умолчанию"
                :rules="[v => !!v || 'Выберите язык']"
              ></v-select>

              <v-btn
                color="primary"
                :disabled="!generalValid || generalLoading"
                :loading="generalLoading"
                @click="saveGeneralSettings"
                class="mt-4"
              >
                Сохранить
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card
          v-if="selectedTab === 1"
          outlined
        >
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-bell</v-icon>
            Настройки уведомлений
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form ref="notificationForm">
              <v-switch
                v-model="notificationSettings.emailNotifications"
                label="Отправлять уведомления по email"
                color="primary"
                class="mb-2"
              ></v-switch>

              <v-switch
                v-model="notificationSettings.newRequestNotification"
                label="Уведомлять о новых заявках"
                color="primary"
                :disabled="!notificationSettings.emailNotifications"
                class="ml-4 mb-2"
              ></v-switch>

              <v-switch
                v-model="notificationSettings.statusChangeNotification"
                label="Уведомлять об изменении статуса заявок"
                color="primary"
                :disabled="!notificationSettings.emailNotifications"
                class="ml-4 mb-2"
              ></v-switch>

              <v-switch
                v-model="notificationSettings.assignmentNotification"
                label="Уведомлять о назначении заявок"
                color="primary"
                :disabled="!notificationSettings.emailNotifications"
                class="ml-4 mb-2"
              ></v-switch>

              <v-switch
                v-model="notificationSettings.commentNotification"
                label="Уведомлять о новых комментариях"
                color="primary"
                :disabled="!notificationSettings.emailNotifications"
                class="ml-4 mb-4"
              ></v-switch>

              <v-divider class="mb-4"></v-divider>

              <v-select
                v-model="notificationSettings.digestFrequency"
                :items="digestOptions"
                label="Частота отправки дайджеста"
                :disabled="!notificationSettings.emailNotifications"
              ></v-select>

              <v-btn
                color="primary"
                :disabled="!notificationSettings.emailNotifications || notificationLoading"
                :loading="notificationLoading"
                @click="saveNotificationSettings"
                class="mt-4"
              >
                Сохранить
              </v-btn>

              <v-btn
                color="secondary"
                text
                :disabled="notificationLoading"
                @click="testNotification"
                class="mt-4 ml-2"
              >
                Отправить тестовое уведомление
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card
          v-if="selectedTab === 2"
          outlined
        >
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-backup-restore</v-icon>
            Резервное копирование
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="mb-4">
              <v-alert
                type="info"
                text
                dense
              >
                Резервное копирование позволяет сохранить данные системы и восстановить их в случае необходимости.
              </v-alert>
            </div>

            <v-card outlined class="mb-4">
              <v-card-title class="subtitle-1">Последнее резервное копирование</v-card-title>
              <v-card-text>
                <v-row align="center">
                  <v-col cols="8">
                    <div v-if="backupInfo.lastBackup">
                      <div><strong>Дата:</strong> {{ formatDateTime(backupInfo.lastBackup.date) }}</div>
                      <div><strong>Размер:</strong> {{ formatSize(backupInfo.lastBackup.size) }}</div>
                      <div><strong>Статус:</strong> {{ backupInfo.lastBackup.status }}</div>
                    </div>
                    <div v-else class="grey--text">
                      Резервных копий не найдено
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <v-btn
                      color="primary"
                      :disabled="backupLoading"
                      :loading="backupLoading"
                      @click="createBackup"
                    >
                      <v-icon left>mdi-database-export</v-icon>
                      Создать резервную копию
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title class="subtitle-1">Настройки автоматического резервного копирования</v-card-title>
              <v-card-text>
                <v-form ref="backupForm">
                  <v-switch
                    v-model="backupSettings.autoBackup"
                    label="Включить автоматическое резервное копирование"
                    color="primary"
                    class="mb-2"
                  ></v-switch>

                  <v-select
                    v-model="backupSettings.frequency"
                    :items="backupFrequencyOptions"
                    label="Частота резервного копирования"
                    :disabled="!backupSettings.autoBackup"
                    class="mb-2"
                  ></v-select>

                  <v-text-field
                    v-model="backupSettings.keepCount"
                    label="Количество хранимых копий"
                    type="number"
                    min="1"
                    max="30"
                    :rules="[
                      v => !!v || 'Введите количество копий',
                      v => v > 0 || 'Значение должно быть больше 0',
                      v => v <= 30 || 'Значение должно быть не больше 30'
                    ]"
                    :disabled="!backupSettings.autoBackup"
                  ></v-text-field>

                  <v-btn
                    color="primary"
                    :disabled="!backupSettings.autoBackup || backupSettingsLoading"
                    :loading="backupSettingsLoading"
                    @click="saveBackupSettings"
                    class="mt-2"
                  >
                    Сохранить настройки
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>

        <v-card
          v-if="selectedTab === 3"
          outlined
        >
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-information</v-icon>
            Информация о системе
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Версия системы</v-list-item-subtitle>
                      <v-list-item-title>{{ systemInfo.version }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Дата установки</v-list-item-subtitle>
                      <v-list-item-title>{{ formatDate(systemInfo.installDate) }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Дата последнего обновления</v-list-item-subtitle>
                      <v-list-item-title>{{ formatDate(systemInfo.lastUpdateDate) }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Количество пользователей</v-list-item-subtitle>
                      <v-list-item-title>{{ systemInfo.userCount }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Количество единиц оборудования</v-list-item-subtitle>
                      <v-list-item-title>{{ systemInfo.equipmentCount }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Количество заявок</v-list-item-subtitle>
                      <v-list-item-title>{{ systemInfo.requestCount }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <v-row>
              <v-col cols="12">
                <h3 class="subtitle-1 mb-2">Статус сервисов</h3>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th class="text-left">Сервис</th>
                      <th class="text-left">Статус</th>
                      <th class="text-left">Время работы</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(service, index) in systemInfo.services" :key="index">
                      <td>{{ service.name }}</td>
                      <td>
                        <v-chip
                          x-small
                          :color="service.status === 'online' ? 'success' : 'error'"
                          text-color="white"
                        >
                          {{ service.status }}
                        </v-chip>
                      </td>
                      <td>{{ service.uptime }}</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>

            <v-row class="mt-4">
              <v-col cols="12" class="d-flex">
                <v-btn
                  color="primary"
                  @click="refreshSystemInfo"
                  :loading="systemInfoLoading"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Обновить информацию
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  color="error"
                  outlined
                  @click="clearCache"
                  :loading="clearCacheLoading"
                >
                  <v-icon left>mdi-cached</v-icon>
                  Очистить кэш
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'SettingsView',
  data() {
    return {
      selectedTab: 0,
      tabs: [
        { title: 'Основные настройки', icon: 'mdi-cog' },
        { title: 'Уведомления', icon: 'mdi-bell' },
        { title: 'Резервное копирование', icon: 'mdi-backup-restore' },
        { title: 'Информация о системе', icon: 'mdi-information' }
      ],
      // Основные настройки
      generalValid: true,
      generalLoading: false,
      generalSettings: {
        companyName: 'ООО "Атэкс-Электро"',
        contactEmail: 'info@atelex.ru',
        defaultPagination: 10,
        defaultLanguage: 'ru'
      },
      paginationOptions: [
        { text: '10 записей', value: 10 },
        { text: '25 записей', value: 25 },
        { text: '50 записей', value: 50 },
        { text: '100 записей', value: 100 }
      ],
      languageOptions: [
        { text: 'Русский', value: 'ru' },
        { text: 'English', value: 'en' }
      ],

      // Настройки уведомлений
      notificationLoading: false,
      notificationSettings: {
        emailNotifications: true,
        newRequestNotification: true,
        statusChangeNotification: true,
        assignmentNotification: true,
        commentNotification: false,
        digestFrequency: 'daily'
      },
      digestOptions: [
        { text: 'Ежедневно', value: 'daily' },
        { text: 'Еженедельно', value: 'weekly' },
        { text: 'Никогда', value: 'never' }
      ],

      backupLoading: false,
      backupSettingsLoading: false,
      backupInfo: {
        lastBackup: {
          date: new Date('2025-04-10T14:30:00'),
          size: 15728640, // 15 MB
          status: 'Успешно'
        }
      },
      backupSettings: {
        autoBackup: true,
        frequency: 'daily',
        keepCount: 7
      },
      backupFrequencyOptions: [
        { text: 'Ежедневно', value: 'daily' },
        { text: 'Еженедельно', value: 'weekly' },
        { text: 'Ежемесячно', value: 'monthly' }
      ],

      // Информация о системе
      systemInfoLoading: false,
      clearCacheLoading: false,
      systemInfo: {
        version: '1.0.0',
        installDate: new Date('2025-01-15'),
        lastUpdateDate: new Date('2025-04-01'),
        userCount: 24,
        equipmentCount: 124,
        requestCount: 78,
        services: [
          { name: 'API Сервер', status: 'online', uptime: '10д 5ч 32м' },
          { name: 'База данных', status: 'online', uptime: '10д 5ч 30м' },
          { name: 'Сервис уведомлений', status: 'online', uptime: '10д 5ч 10м' },
          { name: 'Планировщик задач', status: 'online', uptime: '9д 3ч 15м' }
        ]
      }
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isAdmin'
    ])
  },
  created() {
    if (!this.isAdmin) {
      this.$router.push('/');
      return;
    }

    this.loadSettings();
  },
  methods: {
    async loadSettings() {
      try {
        // Здесь будет загрузка настроек с сервера
        // Пока используем моковые данные

        await new Promise(resolve => setTimeout(resolve, 500));

        // const response = await this.$store.dispatch('settings/getSettings');
        // this.generalSettings = response.generalSettings;
        // this.notificationSettings = response.notificationSettings;
        // this.backupSettings = response.backupSettings;
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке настроек');
      }
    },

    async saveGeneralSettings() {
      if (!this.$refs.generalForm.validate()) return;

      this.generalLoading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // await this.$store.dispatch('settings/saveGeneralSettings', this.generalSettings);

        this.$store.commit('notification/SHOW_SUCCESS', 'Основные настройки успешно сохранены');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при сохранении настроек');
      } finally {
        this.generalLoading = false;
      }
    },

    async saveNotificationSettings() {
      this.notificationLoading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // await this.$store.dispatch('settings/saveNotificationSettings', this.notificationSettings);

        this.$store.commit('notification/SHOW_SUCCESS', 'Настройки уведомлений успешно сохранены');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при сохранении настроек уведомлений');
      } finally {
        this.notificationLoading = false;
      }
    },

    async testNotification() {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // await this.$store.dispatch('settings/sendTestNotification');

        this.$store.commit('notification/SHOW_SUCCESS', 'Тестовое уведомление отправлено');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при отправке тестового уведомления');
      }
    },

    async createBackup() {
      this.backupLoading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        // const backup = await this.$store.dispatch('settings/createBackup');

        this.backupInfo.lastBackup = {
          date: new Date(),
          size: Math.floor(Math.random() * 20000000) + 10000000, // 10-30 MB
          status: 'Успешно'
        };

        this.$store.commit('notification/SHOW_SUCCESS', 'Резервная копия успешно создана');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при создании резервной копии');
      } finally {
        this.backupLoading = false;
      }
    },

    async saveBackupSettings() {
      this.backupSettingsLoading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // await this.$store.dispatch('settings/saveBackupSettings', this.backupSettings);

        this.$store.commit('notification/SHOW_SUCCESS', 'Настройки резервного копирования успешно сохранены');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при сохранении настроек резервного копирования');
      } finally {
        this.backupSettingsLoading = false;
      }
    },

    async refreshSystemInfo() {
      this.systemInfoLoading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // const info = await this.$store.dispatch('settings/getSystemInfo');
        // this.systemInfo = info;

        this.$store.commit('notification/SHOW_SUCCESS', 'Информация о системе успешно обновлена');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при обновлении информации о системе');
      } finally {
        this.systemInfoLoading = false;
      }
    },

    async clearCache() {
      this.clearCacheLoading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        // await this.$store.dispatch('settings/clearCache');

        this.$store.commit('notification/SHOW_SUCCESS', 'Кэш успешно очищен');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при очистке кэша');
      } finally {
        this.clearCacheLoading = false;
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
    },

    formatSize(bytes) {
      if (bytes === 0) return '0 Байт';

      const k = 1024;
      const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
};
</script>