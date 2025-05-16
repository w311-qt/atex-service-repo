<template>
  <v-dialog v-model="dialogVisible" max-width="600px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Изменение статуса заявки</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <div class="subtitle-2 mb-2">Текущий статус:</div>
                <v-chip
                  :color="getCurrentStatusColor()"
                  text-color="white"
                  class="mb-4"
                >
                  {{ getCurrentStatusName() }}
                </v-chip>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.statusId"
                  :items="availableStatuses"
                  :rules="statusRules"
                  item-text="name"
                  item-value="id"
                  label="Новый статус*"
                  required
                >
                  <template v-slot:item="{ item }">
                    <v-chip
                      small
                      :color="item.color || 'grey'"
                      text-color="white"
                      class="mr-2"
                    ></v-chip>
                    {{ item.name }}
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.comment"
                  label="Комментарий"
                  rows="3"
                  placeholder="Добавьте комментарий о причине изменения статуса..."
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">Отмена</v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="saveStatus"
          :disabled="!valid || loading"
          :loading="loading"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'RequestStatusDialog',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    request: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: this.dialog,
      valid: true,
      loading: false,
      formData: {
        statusId: '',
        comment: ''
      },
      statusRules: [
        v => !!v || 'Статус обязателен'
      ],
      allowedTransitions: {
      }
    };
  },
  computed: {
    ...mapGetters('requests', [
      'allRequestStatuses',
      'requestStatusById'
    ]),
    requestStatuses() {
      return this.allRequestStatuses || [];
    },
    availableStatuses() {
      if (!this.request || !this.request.statusId) return [];

      const currentStatusId = this.request.statusId;

      if (this.allowedTransitions[currentStatusId]) {
        return this.requestStatuses.filter(status =>
          this.allowedTransitions[currentStatusId].includes(status.id) &&
          status.id !== currentStatusId
        );
      }

      return this.requestStatuses.filter(status => status.id !== currentStatusId);
    }
  },
  watch: {
    dialog(newVal) {
      this.dialogVisible = newVal;
    },
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('close');
      }
    },
    request: {
      handler(newVal) {
        if (newVal && newVal.statusId) {
          this.formData.statusId = '';
          this.formData.comment = '';
        }
      },
      immediate: true
    }
  },
  created() {
    if (this.requestStatuses.length === 0) {
      this.$store.dispatch('requests/fetchRequestStatuses');
    }

    this.initializeStatusTransitions();
  },
  methods: {
    initializeStatusTransitions() {

      this.$store.dispatch('requests/fetchRequestStatuses').then(() => {
        const statuses = this.requestStatuses;

        const findStatusIdByName = (name) => {
          const status = statuses.find(s => s.name === name);
          return status ? status.id : null;
        };

        const newStatusId = findStatusIdByName('Новая');
        const inProgressStatusId = findStatusIdByName('В работе');
        const waitingStatusId = findStatusIdByName('Ожидает');
        const completedStatusId = findStatusIdByName('Выполнена');
        const canceledStatusId = findStatusIdByName('Отменена');

        if (newStatusId) {
          this.allowedTransitions[newStatusId] = [
            inProgressStatusId,
            canceledStatusId
          ].filter(Boolean);
        }

        if (inProgressStatusId) {
          this.allowedTransitions[inProgressStatusId] = [
            waitingStatusId,
            completedStatusId,
            canceledStatusId
          ].filter(Boolean);
        }

        if (waitingStatusId) {
          this.allowedTransitions[waitingStatusId] = [
            inProgressStatusId,
            completedStatusId,
            canceledStatusId
          ].filter(Boolean);
        }

        if (completedStatusId) {
          this.allowedTransitions[completedStatusId] = [];
        }

        if (canceledStatusId) {
          this.allowedTransitions[canceledStatusId] = [];
        }
      });
    },

    getCurrentStatusName() {
      if (!this.request || !this.request.status) return 'Не указан';
      return this.request.status.name;
    },

    getCurrentStatusColor() {
      if (!this.request || !this.request.status) return 'grey';
      return this.request.status.color || 'blue';
    },

    close() {
      this.dialogVisible = false;
      this.formData.statusId = '';
      this.formData.comment = '';
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    async saveStatus() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          await this.$store.dispatch('requests/changeRequestStatus', {
            id: this.request.id,
            statusId: this.formData.statusId,
            comment: this.formData.comment
          });

          this.$store.commit('notification/SHOW_SUCCESS', 'Статус заявки успешно изменен');
          this.$emit('updated');
          this.close();
        } catch (error) {
          const errorMessage = error.message || 'Ошибка при изменении статуса';
          this.$store.commit('notification/SHOW_ERROR', errorMessage);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>