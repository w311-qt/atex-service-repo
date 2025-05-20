<template>
  <v-dialog v-model="dialogVisible" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Назначение заявок</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="formData.userId"
                  :items="technicians"
                  item-text="name"
                  item-value="id"
                  label="Исполнитель*"
                  :rules="userRules"
                  :loading="technicianLoading"
                  required
                >
                  <template v-slot:item="{ item }">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ item.department || '' }}{{ item.position ? ', ' + item.position : '' }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.requestIds"
                  :items="unassignedRequests"
                  item-text="displayText"
                  item-value="id"
                  label="Заявки для назначения*"
                  :rules="requestRules"
                  :loading="requestsLoading"
                  multiple
                  chips
                  small-chips
                ></v-select>

                <!-- Сообщение при отсутствии заявок -->
                <v-alert
                  v-if="!requestsLoading && unassignedRequests.length === 0"
                  type="info"
                  text
                  dense
                  class="mt-2"
                >
                  Нет доступных неназначенных заявок. Создайте новую заявку или освободите существующую от назначения.
                </v-alert>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.comment"
                  label="Комментарий"
                  rows="3"
                  placeholder="Добавьте комментарий о назначении..."
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
        <small>*обязательные поля</small>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">Отмена</v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="assignRequests"
          :disabled="!valid || loading || unassignedRequests.length === 0"
          :loading="loading"
        >
          Назначить
        </v-btn>
      </v-card-actions>

      <v-snackbar
        v-model="showResults"
        :timeout="3000"
        :color="hasErrors ? 'warning' : 'success'"
        bottom
      >
        {{ resultsMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="showResults = false"
          >
            Закрыть
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'AssignRequestsDialog',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    initialTechnicianId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.dialog,
      valid: true,
      loading: false,
      technicianLoading: false,
      requestsLoading: false,
      formData: {
        userId: this.initialTechnicianId,
        requestIds: [],
        comment: ''
      },
      technicians: [],
      unassignedRequests: [],
      userRules: [
        v => !!v || 'Необходимо выбрать исполнителя'
      ],
      requestRules: [
        v => (v && v.length > 0) || 'Необходимо выбрать хотя бы одну заявку'
      ],
      results: {
        success: 0,
        errors: 0
      },
      showResults: false,
      hasErrors: false,
      resultsMessage: ''
    };
  },
  computed: {
    ...mapGetters('auth', [
      'currentUser'
    ])
  },
  watch: {
    dialog(newVal) {
      this.dialogVisible = newVal;
      if (newVal) {
        this.loadData();
      }
    },
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('close');
      }
    },
    initialTechnicianId(newVal) {
      this.formData.userId = newVal;
    }
  },
  created() {
    if (this.dialog) {
      this.loadData();
    }
  },
  methods: {
    async loadData() {
      await Promise.all([
        this.loadTechnicians(),
        this.loadUnassignedRequests()
      ]);
    },

    async loadTechnicians() {
      this.technicianLoading = true;
      try {
        await this.$store.dispatch('users/fetchTechnicians');
        this.technicians = this.$store.getters['users/allTechnicians'] || [];
      } catch (error) {
        console.error('Error loading technicians:', error);
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке списка техников');
      } finally {
        this.technicianLoading = false;
      }
    },

    async loadUnassignedRequests() {
      this.requestsLoading = true;
      try {
        // Загружаем все заявки без фильтра по assignedToId
        const response = await this.$store.dispatch('requests/fetchRequests', {
          limit: 100,
          sortBy: 'createdAt',
          order: 'DESC'
        });

        // Проверяем ответ
        console.log('Requests response:', response);

        // Фильтруем заявки на клиенте, отбирая только неназначенные
        if (response && response.data) {
          this.unassignedRequests = response.data
            .filter(request => !request.assignedToId)
            .map(request => ({
              id: request.id,
              displayText: `${request.number} - ${request.title}`,
              request
            }));

          console.log(`Loaded ${this.unassignedRequests.length} unassigned requests`);
        } else {
          console.error('Unexpected response format:', response);
          this.unassignedRequests = [];
        }
      } catch (error) {
        console.error('Error loading unassigned requests:', error);
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке заявок');
        this.unassignedRequests = [];
      } finally {
        this.requestsLoading = false;
      }
    },

    close() {
      this.dialogVisible = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = {
        userId: this.initialTechnicianId,
        requestIds: [],
        comment: ''
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
      this.results = { success: 0, errors: 0 };
      this.showResults = false;
    },

    async assignRequests() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      this.results = { success: 0, errors: 0 };

      try {
        const promises = this.formData.requestIds.map(requestId =>
          this.$store.dispatch('requests/assignRequest', {
            id: requestId,
            userId: this.formData.userId,
            comment: this.formData.comment || 'Заявка назначена'
          })
        );

        const results = await Promise.allSettled(promises);

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            this.results.success++;
          } else {
            this.results.errors++;
            console.error('Failed to assign request:', result.reason);
          }
        });

        this.hasErrors = this.results.errors > 0;
        this.resultsMessage = this.hasErrors
          ? `Назначено заявок: ${this.results.success}, ошибок: ${this.results.errors}`
          : `Успешно назначено заявок: ${this.results.success}`;

        this.showResults = true;

        if (!this.hasErrors) {
          setTimeout(() => {
            this.$emit('assigned', {
              technicianId: this.formData.userId,
              successCount: this.results.success
            });
            this.close();
          }, 1500);
        } else {
          this.$store.commit('notification/SHOW_WARNING', this.resultsMessage);
        }
      } catch (error) {
        console.error('Error in batch assignment:', error);
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при назначении заявок');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>