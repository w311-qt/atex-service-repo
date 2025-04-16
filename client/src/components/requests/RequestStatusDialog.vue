<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
    @keydown.esc="close"
  >
    <v-card>
      <v-card-title class="headline primary white--text">
        Изменение статуса заявки
        <v-spacer></v-spacer>
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-container>
            <v-row>
              <v-col cols="12">
                <div class="subtitle-1 mb-2">Текущий статус:</div>
                <v-chip
                  :color="getCurrentStatusColor()"
                  text-color="white"
                  class="mb-4"
                >
                  {{ request.status.name }}
                </v-chip>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="statusData.statusId"
                  :items="allowedStatuses"
                  item-text="name"
                  item-value="id"
                  :rules="requiredRules"
                  label="Новый статус"
                  required
                  outlined
                >
                  <template v-slot:selection="{ item }">
                    <v-chip
                      :color="getStatusColor(item)"
                      text-color="white"
                    >
                      {{ item.name }}
                    </v-chip>
                  </template>
                  <template v-slot:item="{ item }">
                    <v-chip
                      :color="getStatusColor(item)"
                      text-color="white"
                      class="mr-2"
                    ></v-chip>
                    {{ item.name }}
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="statusData.comment"
                  label="Комментарий"
                  hint="Добавьте комментарий к изменению статуса"
                  outlined
                  auto-grow
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-1"
          text
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!valid || !statusData.statusId || loading"
          :loading="loading"
          @click="changeStatus"
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
    request: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialog: true,
      valid: false,
      loading: false,
      statusData: {
        statusId: '',
        comment: ''
      },
      requiredRules: [
        v => !!v || 'Поле обязательно для заполнения',
      ]
    };
  },
  computed: {
    ...mapGetters({
      statuses: 'requests/getStatuses',
      currentUser: 'auth/getUser',
    }),
    allowedStatuses() {
      // Определяем, какие статусы доступны для перехода из текущего статуса заявки
      const currentStatusId = this.request.statusId;
      const currentStatus = this.request.status?.name;

      // Определение разрешенных переходов статусов
      // Этот объект содержит правила переходов из одного статуса в другой
      const allowedTransitions = {
        'Новая': ['В работе', 'Отменена'],
        'В работе': ['Ожидает', 'Выполнена', 'Отменена'],
        'Ожидает': ['В работе', 'Выполнена', 'Отменена'],
        'Выполнена': [], // Нет разрешенных переходов из статуса "Выполнена"
        'Отменена': []  // Нет разрешенных переходов из статуса "Отменена"
      };

      const allowedStatusNames = allowedTransitions[currentStatus] || [];

      // Фильтруем статусы, которые разрешены для перехода
      return this.statuses.filter(status =>
        allowedStatusNames.includes(status.name) && status.id !== currentStatusId
      );
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },

    async changeStatus() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      try {
        await this.$store.dispatch('requests/changeRequestStatus', {
          id: this.request.id,
          data: this.statusData
        });
        this.$emit('status-changed');
      } catch (error) {
        this.$store.dispatch('notifications/showError',
          error.response?.data?.message || 'Ошибка при изменении статуса заявки'
        );
      } finally {
        this.loading = false;
      }
    },

    getCurrentStatusColor() {
      return this.request.status?.color || '#757575';
    },

    getStatusColor(status) {
      return status?.color || '#757575';
    }
  }
};
</script>
