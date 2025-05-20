<template>
  <v-dialog v-model="dialogVisible" max-width="700px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Назначение заявки</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <template v-if="loading">
            <div class="text-center py-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="mt-2">Загрузка данных...</div>
            </div>
          </template>
          <template v-else>
            <v-row>
              <v-col cols="12">
                <div class="subtitle-1 font-weight-bold mb-2">Информация о заявке</div>
                <v-card outlined class="pa-3 mb-4">
                  <div><strong>№:</strong> {{ request.number }}</div>
                  <div><strong>Заголовок:</strong> {{ request.title }}</div>
                  <div><strong>Тип:</strong> {{ request.type ? request.type.name : 'Не указан' }}</div>
                  <div><strong>Приоритет:</strong> {{ request.priority ? request.priority.name : 'Не указан' }}</div>
                  <div><strong>Статус:</strong> {{ request.status ? request.status.name : 'Не указан' }}</div>
                  <div><strong>Создана:</strong> {{ formatDateTime(request.createdAt) }}</div>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-form ref="form" v-model="valid" lazy-validation>
                  <div class="subtitle-1 font-weight-bold mb-2">Назначение исполнителя</div>

                  <div v-if="request.assignedTo" class="mb-3">
                    <v-alert
                      type="info"
                      text
                      dense
                    >
                      <span class="font-weight-medium">Текущий исполнитель:</span>
                      {{ request.assignedTo.name }}
                      ({{ request.assignedTo.department ? request.assignedTo.department + ', ' : '' }}
                      {{ request.assignedTo.position || 'Техник' }})
                    </v-alert>
                  </div>

                  <v-select
                    v-model="formData.userId"
                    :items="technicians"
                    item-text="name"
                    item-value="id"
                    :label="request.assignedTo ? 'Изменить исполнителя' : 'Выберите исполнителя'"
                    :loading="technicianLoading"
                    :hint="request.assignedTo ? 'Оставьте пустым чтобы снять текущего исполнителя' : ''"
                    persistent-hint
                    clearable
                  >
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ item.department || '' }}{{ item.position ? ', ' + item.position : '' }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </template>

                    <template v-slot:selection="{ item }">
                      <span>{{ item.name }}</span>
                    </template>
                  </v-select>

                  <!-- Комментарий -->
                  <v-textarea
                    v-model="formData.comment"
                    label="Комментарий"
                    rows="3"
                    class="mt-3"
                    placeholder="Добавьте комментарий о назначении..."
                    clearable
                  ></v-textarea>
                </v-form>
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="close">Отмена</v-btn>
        <v-btn
          color="primary"
          text
          @click="assign"
          :disabled="assignLoading"
          :loading="assignLoading"
        >
          {{ request.assignedTo && !formData.userId ? 'Отменить назначение' : 'Назначить' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RequestAssignmentDialog',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    requestId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: this.dialog,
      valid: true,
      loading: false,
      assignLoading: false,
      technicianLoading: false,
      request: {},
      technicians: [],
      formData: {
        userId: null,
        comment: ''
      }
    };
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
    requestId(newVal) {
      if (newVal && this.dialogVisible) {
        this.loadData();
      }
    }
  },
  created() {
    if (this.dialog && this.requestId) {
      this.loadData();
    }
  },
  methods: {
    async loadData() {
      this.loading = true;

      try {
        await this.loadRequest();
        await this.loadTechnicians();

        if (this.request.assignedTo) {
          this.formData.userId = this.request.assignedTo.id;
        } else {
          this.formData.userId = null;
        }
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке данных');
      } finally {
        this.loading = false;
      }
    },

    async loadRequest() {
      try {
        const response = await this.$store.dispatch('requests/fetchRequestById', this.requestId);
        this.request = response || {};
      } catch (error) {
        console.error('Error loading request data:', error);
        throw error;
      }
    },

    async loadTechnicians() {
      this.technicianLoading = true;
      try {
        await this.$store.dispatch('users/fetchTechnicians');
        this.technicians = this.$store.getters['users/allTechnicians'] || [];
      } catch (error) {
        console.error('Error loading technicians:', error);
        throw error;
      } finally {
        this.technicianLoading = false;
      }
    },

    close() {
      this.dialogVisible = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = {
        userId: this.request.assignedTo?.id || null,
        comment: ''
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    async assign() {
      this.assignLoading = true;

      try {
        const response = await this.$store.dispatch('requests/assignRequest', {
          id: this.requestId,
          userId: this.formData.userId,
          comment: this.formData.comment || (this.formData.userId ? 'Заявка назначена' : 'Заявка снята с исполнителя')
        });

        const successMessage = this.formData.userId
          ? `Заявка успешно назначена ${this.getTechnicianName(this.formData.userId)}`
          : 'Заявка снята с исполнителя';

        this.$store.commit('notification/SHOW_SUCCESS', successMessage);
        this.$emit('assigned', response);
        this.close();
      } catch (error) {
        console.error('Error assigning request:', error);
        const errorMessage = error.response?.data?.message || 'Ошибка при назначении заявки';
        this.$store.commit('notification/SHOW_ERROR', errorMessage);
      } finally {
        this.assignLoading = false;
      }
    },

    getTechnicianName(technicianId) {
      const technician = this.technicians.find(t => t.id === technicianId);
      return technician ? technician.name : '';
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