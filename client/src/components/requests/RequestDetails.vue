<template>
  <div class="request-details">
    <v-container>
      <v-row v-if="loading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-col>
      </v-row>

      <template v-else-if="request">
        <v-row>
          <!-- Кнопки навигации и действий -->
          <v-col cols="12" class="d-flex align-center mb-4">
            <v-btn
              color="primary"
              text
              @click="$router.go(-1)"
              class="mr-2"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Назад
            </v-btn>

            <v-spacer></v-spacer>

            <template v-if="canManageRequest">
              <v-btn
                color="primary"
                class="mr-2"
                v-if="canChangeStatus"
                @click="openStatusDialog"
              >
                <v-icon left>mdi-refresh</v-icon>
                Изменить статус
              </v-btn>

              <v-btn
                color="info"
                class="mr-2"
                v-if="isAdmin && !request.assignedToId"
                @click="openAssignDialog"
              >
                <v-icon left>mdi-account-plus</v-icon>
                Назначить
              </v-btn>

              <v-btn
                color="success"
                class="mr-2"
                v-if="canComplete"
                @click="openCompleteDialog"
              >
                <v-icon left>mdi-check</v-icon>
                Завершить
              </v-btn>

              <v-btn
                color="error"
                v-if="canCancel"
                @click="openCancelDialog"
              >
                <v-icon left>mdi-close</v-icon>
                Отменить
              </v-btn>
            </template>
          </v-col>
        </v-row>

        <v-row>
          <!-- Основная информация о заявке -->
          <v-col cols="12" md="8">
            <v-card>
              <v-card-title>
                <v-icon large left :color="getRequestTypeColor(request.type)">
                  {{ getRequestTypeIcon(request.type) }}
                </v-icon>
                <div>
                  {{ request.title }}
                  <div class="subtitle-1 grey--text">№{{ request.number }}</div>
                </div>
                <v-spacer></v-spacer>
                <v-chip
                  :color="getStatusColor(request.status)"
                  text-color="white"
                >
                  {{ request.status ? request.status.name : 'Статус не указан' }}
                </v-chip>
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="caption grey--text">Тип заявки</div>
                    <div>{{ request.type ? request.type.name : 'Не указан' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="caption grey--text">Приоритет</div>
                    <v-chip
                      small
                      :color="getPriorityColor(request.priority)"
                      text-color="white"
                    >
                      {{ request.priority ? request.priority.name : 'Не указан' }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="caption grey--text">Создана</div>
                    <div>{{ formatDateTime(request.createdAt) }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="caption grey--text">Завершена</div>
                    <div>{{ request.completedAt ? formatDateTime(request.completedAt) : 'Не завершена' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="caption grey--text">Создал</div>
                    <div>{{ request.createdBy ? request.createdBy.name : 'Не указан' }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="caption grey--text">Исполнитель</div>
                    <div class="d-flex align-center">
                      {{ request.assignedTo ? request.assignedTo.name : 'Не назначен' }}
                      <v-btn
                        x-small
                        text
                        color="primary"
                        class="ml-2"
                        @click="openAssignDialog"
                        v-if="isAdmin"
                      >
                        <v-icon x-small>mdi-pencil</v-icon>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>

                <v-divider class="my-4"></v-divider>

                <!-- Информация об оборудовании, если указано -->
                <template v-if="request.equipmentId && request.equipment">
                  <div class="subtitle-1 mb-2">Оборудование</div>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="caption grey--text">Наименование</div>
                      <div>
                        <router-link :to="{ name: 'EquipmentDetails', params: { id: request.equipmentId } }">
                          {{ request.equipment.name }}
                        </router-link>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="caption grey--text">Инв. номер</div>
                      <div>{{ request.equipment.inventoryNumber }}</div>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="caption grey--text">Статус</div>
                      <v-chip
                        x-small
                        :color="getEquipmentStatusColor(request.equipment.status)"
                        text-color="white"
                      >
                        {{ request.equipment.status ? request.equipment.status.name : 'Не указан' }}
                      </v-chip>
                    </v-col>
                  </v-row>
                  <v-divider class="my-4"></v-divider>
                </template>

                <!-- Информация о картридже, если это заявка на заправку -->
                <template v-if="request.cartridgeModel">
                  <div class="subtitle-1 mb-2">Картридж</div>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="caption grey--text">Модель</div>
                      <div>{{ request.cartridgeModel }}</div>
                    </v-col>
                  </v-row>
                  <v-divider class="my-4"></v-divider>
                </template>

                <div class="subtitle-1 mb-2">Описание</div>
                <div>{{ request.description || 'Описание отсутствует' }}</div>
              </v-card-text>
            </v-card>

            <!-- Добавить комментарий -->
            <v-card class="mt-4" v-if="canAddComment">
              <v-card-title>Добавить комментарий</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="addComment">
                  <v-textarea
                    v-model="commentText"
                    label="Ваш комментарий"
                    rows="3"
                    counter="500"
                    :rules="commentRules"
                  ></v-textarea>
                  <v-btn
                    color="primary"
                    @click="addComment"
                    :loading="commentLoading"
                    :disabled="!commentText || commentLoading"
                  >
                    Отправить
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- История активностей по заявке -->
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>История активностей</v-card-title>
              <v-card-text class="pa-0">
                <v-timeline dense class="pt-0">
                  <v-timeline-item
                    v-for="activity in activities"
                    :key="activity.id"
                    :color="getActivityColor(activity.type)"
                    small
                  >
                    <div class="font-weight-normal">
                      <strong>{{ getActivityTitle(activity) }}</strong>
                      <div>{{ activity.message }}</div>
                      <div>
                        <span class="caption grey--text">
                          {{ formatDateTime(activity.timestamp) }}
                        </span>
                        <span class="caption grey--text ml-2">
                          {{ activity.user ? activity.user.name : 'Система' }}
                        </span>
                      </div>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <v-row v-else>
        <v-col cols="12">
          <v-alert type="error">
            Заявка не найдена
          </v-alert>
        </v-col>
      </v-row>
    </v-container>

    <!-- Диалоги для работы с заявкой -->
    <request-status-dialog
      :dialog="statusDialog"
      :request="request"
      @close="closeStatusDialog"
      @updated="fetchRequest"
    />

    <assign-request-dialog
      :dialog="assignDialog"
      :requestId="requestId"
      :currentUserId="request ? request.assignedToId : null"
      @close="closeAssignDialog"
      @assigned="fetchRequest"
    />

    <v-dialog v-model="completeDialog" max-width="500px">
      <v-card>
        <v-card-title>Завершение заявки</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="completeComment"
            label="Комментарий о выполнении"
            rows="3"
            placeholder="Опишите, как была выполнена заявка..."
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="completeDialog = false">Отмена</v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="completeRequest"
            :loading="loading"
          >
            Завершить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cancelDialog" max-width="500px">
      <v-card>
        <v-card-title>Отмена заявки</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="cancelReason"
            label="Причина отмены"
            rows="3"
            :rules="[v => !!v || 'Необходимо указать причину отмены']"
            placeholder="Укажите причину отмены заявки..."
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelDialog = false">Отмена</v-btn>
          <v-btn
            color="red darken-1"
            text
            @click="cancelRequest"
            :loading="loading"
            :disabled="!cancelReason"
          >
            Отменить заявку
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import RequestStatusDialog from '@/components/requests/RequestStatusDialog.vue';
import AssignRequestDialog from '@/components/requests/AssignRequestDialog.vue';

export default {
  name: 'RequestDetails',
  components: {
    RequestStatusDialog,
    AssignRequestDialog
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      requestId: this.id,
      loading: false,
      statusDialog: false,
      assignDialog: false,
      completeDialog: false,
      cancelDialog: false,
      commentText: '',
      commentLoading: false,
      completeComment: '',
      cancelReason: '',
      commentRules: [
        v => (v && v.length <= 500) || 'Максимальная длина комментария - 500 символов'
      ],
      activities: []
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isAdmin',
      'isTechnician',
      'currentUser'
    ]),
    request() {
      return this.$store.getters['requests/currentRequest'];
    },
    // Проверка прав на управление заявкой
    canManageRequest() {
      if (!this.request || !this.currentUser) return false;

      // Администраторы могут всё
      if (this.isAdmin) return true;

      // Техники могут управлять заявками, назначенными им
      if (this.isTechnician && this.request.assignedToId === this.currentUser.id) return true;

      // Обычные пользователи могут управлять своими заявками, но только если они не назначены технику
      if (this.request.createdById === this.currentUser.id && !this.request.assignedToId) return true;

      return false;
    },
    // Возможность изменения статуса
    canChangeStatus() {
      if (!this.request) return false;

      // Нельзя менять статус у завершенных и отмененных заявок
      const isTerminalStatus =
        this.request.status?.name === 'Выполнена' ||
        this.request.status?.name === 'Отменена';

      return this.canManageRequest && !isTerminalStatus;
    },
    // Возможность завершения заявки
    canComplete() {
      if (!this.request) return false;

      // Завершить можно только заявки в работе или ожидании
      const canBeCompleted =
        this.request.status?.name === 'В работе' ||
        this.request.status?.name === 'Ожидает';

      return this.canManageRequest && canBeCompleted;
    },
    // Возможность отмены заявки
    canCancel() {
      if (!this.request) return false;

      // Нельзя отменить уже завершенные или отмененные заявки
      const isTerminalStatus =
        this.request.status?.name === 'Выполнена' ||
        this.request.status?.name === 'Отменена';

      return this.canManageRequest && !isTerminalStatus;
    },
    // Возможность добавления комментария
    canAddComment() {
      if (!this.request || !this.currentUser) return false;

      // К завершенным и отмененным заявкам нельзя добавлять комментарии
      const isTerminalStatus =
        this.request.status?.name === 'Выполнена' ||
        this.request.status?.name === 'Отменена';

      // Создатель заявки, назначенный техник и администраторы могут комментировать
      const canComment =
        this.isAdmin ||
        this.request.createdById === this.currentUser.id ||
        (this.isTechnician && this.request.assignedToId === this.currentUser.id);

      return canComment && !isTerminalStatus;
    }
  },
  created() {
    this.fetchRequest();
    this.fetchActivities();
  },
  methods: {
    // Получение данных заявки
    async fetchRequest() {
      this.loading = true;
      try {
        await this.$store.dispatch('requests/fetchRequestById', this.requestId);
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке заявки');
      } finally {
        this.loading = false;
      }
    },

    // Получение истории активностей
    async fetchActivities() {
      try {
        const response = await this.$store.dispatch('requests/fetchRequestActivities', this.requestId);
        this.activities = response || [];
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке истории заявки');
      }
    },

    // Диалоги для работы с заявкой
    openStatusDialog() {
      this.statusDialog = true;
    },

    closeStatusDialog() {
      this.statusDialog = false;
    },

    openAssignDialog() {
      this.assignDialog = true;
    },

    closeAssignDialog() {
      this.assignDialog = false;
    },

    openCompleteDialog() {
      this.completeDialog = true;
    },

    openCancelDialog() {
      this.cancelDialog = true;
    },

    // Действия с заявкой
    async addComment() {
      if (!this.commentText) return;

      this.commentLoading = true;
      try {
        await this.$store.dispatch('requests/addRequestComment', {
          id: this.requestId,
          comment: this.commentText
        });

        this.commentText = '';
        this.fetchActivities(); // Обновляем историю после добавления комментария
        this.$store.commit('notification/SHOW_SUCCESS', 'Комментарий добавлен');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при добавлении комментария');
      } finally {
        this.commentLoading = false;
      }
    },

    async completeRequest() {
      this.loading = true;
      try {
        await this.$store.dispatch('requests/completeRequest', {
          id: this.requestId,
          resolutionComment: this.completeComment
        });

        this.completeDialog = false;
        this.completeComment = '';
        this.fetchRequest();
        this.fetchActivities();
        this.$store.commit('notification/SHOW_SUCCESS', 'Заявка успешно завершена');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при завершении заявки');
      } finally {
        this.loading = false;
      }
    },

    async cancelRequest() {
      if (!this.cancelReason) return;

      this.loading = true;
      try {
        await this.$store.dispatch('requests/cancelRequest', {
          id: this.requestId,
          reason: this.cancelReason
        });

        this.cancelDialog = false;
        this.cancelReason = '';
        this.fetchRequest();
        this.fetchActivities();
        this.$store.commit('notification/SHOW_SUCCESS', 'Заявка отменена');
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при отмене заявки');
      } finally {
        this.loading = false;
      }
    },

    // Вспомогательные методы
    formatDateTime(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    getStatusColor(status) {
      if (!status) return 'grey';
      return status.color || 'blue';
    },

    getPriorityColor(priority) {
      if (!priority) return 'grey';
      return priority.color || 'blue';
    },

    getRequestTypeColor(type) {
      if (!type) return 'grey';
      return type.color || 'blue';
    },

    getRequestTypeIcon(type) {
      if (!type) return 'mdi-help-circle';

      // Определение иконки в зависимости от типа заявки
      const typeName = type.name.toLowerCase();
      if (typeName.includes('ремонт')) return 'mdi-tools';
      if (typeName.includes('заправка') || typeName.includes('картридж')) return 'mdi-printer';
      if (typeName.includes('утилизация')) return 'mdi-delete';
      if (typeName.includes('перемещение')) return 'mdi-truck-delivery';

      return 'mdi-file-document';
    },

    getEquipmentStatusColor(status) {
      if (!status) return 'grey';
      return status.color || 'blue';
    },

    getActivityColor(type) {
      const typeColors = {
        create: 'green',
        update: 'blue',
        statusChange: 'orange',
        comment: 'purple',
        assign: 'indigo',
        complete: 'green',
        cancel: 'red'
      };

      return typeColors[type] || 'grey';
    },

    getActivityTitle(activity) {
      const typeTitles = {
        create: 'Создание заявки',
        update: 'Обновление заявки',
        statusChange: 'Изменение статуса',
        comment: 'Комментарий',
        assign: 'Назначение исполнителя',
        complete: 'Завершение заявки',
        cancel: 'Отмена заявки'
      };

      return typeTitles[activity.type] || 'Действие';
    }
  }
};
</script>

<style scoped>
.request-details {
  width: 100%;
}
</style>