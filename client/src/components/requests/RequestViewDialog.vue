<template>
  <v-dialog v-model="dialogVisible" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Просмотр заявки</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <div class="d-flex align-center">
                <v-icon :color="getRequestTypeColor(request.type)" class="mr-2">
                  {{ getRequestTypeIcon(request.type) }}
                </v-icon>
                <h3>{{ request.title }}</h3>
              </div>
              <div class="subtitle-1 grey--text">№{{ request.number }}</div>
            </v-col>

            <v-col cols="12">
              <v-divider class="mb-3"></v-divider>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="caption grey--text">Тип заявки</div>
              <div class="d-flex align-center">
                <v-icon :color="getRequestTypeColor(request.type)" class="mr-1" small>
                  mdi-circle
                </v-icon>
                <span>{{ request.type ? request.type.name : 'Не указан' }}</span>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="caption grey--text">Статус</div>
              <div class="d-flex align-center">
                <v-chip
                  small
                  :color="getStatusColor(request.status)"
                  text-color="white"
                >
                  {{ request.status ? request.status.name : 'Не указан' }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="caption grey--text">Приоритет</div>
              <div class="d-flex align-center">
                <v-chip
                  small
                  :color="getPriorityColor(request.priority)"
                  text-color="white"
                >
                  {{ request.priority ? request.priority.name : 'Не указан' }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="caption grey--text">Создана</div>
              <div>{{ formatDateTime(request.createdAt) }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="caption grey--text">Создал</div>
              <div>{{ request.createdBy ? request.createdBy.name : 'Не указан' }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="caption grey--text">Исполнитель</div>
              <div>{{ request.assignedTo ? request.assignedTo.name : 'Не назначен' }}</div>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-3"></v-divider>
            </v-col>

            <template v-if="request.equipmentId && request.equipment">
              <v-col cols="12">
                <div class="subtitle-1 mb-2">Оборудование</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="caption grey--text">Наименование</div>
                <div>{{ request.equipment.name }}</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="caption grey--text">Инв. номер</div>
                <div>{{ request.equipment.inventoryNumber }}</div>
              </v-col>

              <v-col cols="12">
                <v-divider class="my-3"></v-divider>
              </v-col>
            </template>

            <!-- Информация о картридже, если это заявка на заправку -->
            <template v-if="request.cartridgeModel">
              <v-col cols="12">
                <div class="subtitle-1 mb-2">Картридж</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="caption grey--text">Модель</div>
                <div>{{ request.cartridgeModel }}</div>
              </v-col>

              <v-col cols="12">
                <v-divider class="my-3"></v-divider>
              </v-col>
            </template>

            <v-col cols="12" sm="6" v-if="request.location">
              <div class="caption grey--text">Местоположение</div>
              <div>{{ request.location }}</div>
            </v-col>

            <v-col cols="12">
              <div class="subtitle-1 mb-2">Описание</div>
              <div>{{ request.description || 'Описание отсутствует' }}</div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">Закрыть</v-btn>
        <v-btn
          v-if="canEdit"
          color="primary"
          @click="editRequest"
        >
          <v-icon left>mdi-pencil</v-icon>
          Редактировать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'RequestViewDialog',
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
      dialogVisible: this.dialog
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isAdmin',
      'isTechnician',
      'currentUser'
    ]),
    canEdit() {
      if (!this.request || !this.currentUser) return false;

      if (this.isAdmin) return true;

      if (this.isTechnician && this.request.assignedToId === this.currentUser.id) return true;

      if (this.request.createdById === this.currentUser.id && !this.request.assignedToId) return true;

      return false;
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
    }
  },
  methods: {
    close() {
      this.dialogVisible = false;
    },

    editRequest() {
      this.$emit('edit', this.request);
      this.close();
    },

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

    getRequestTypeColor(type) {
      if (!type) return 'grey';
      return type.color || 'blue';
    },

    getRequestTypeIcon(type) {
      if (!type) return 'mdi-help-circle';

      const typeName = type.name.toLowerCase();
      if (typeName.includes('ремонт')) return 'mdi-tools';
      if (typeName.includes('заправка') || typeName.includes('картридж')) return 'mdi-printer';
      if (typeName.includes('утилизация')) return 'mdi-delete';
      if (typeName.includes('перемещение')) return 'mdi-truck-delivery';

      return 'mdi-file-document';
    },

    getStatusColor(status) {
      if (!status) return 'grey';
      return status.color || 'blue';
    },

    getPriorityColor(priority) {
      if (!priority) return 'grey';
      return priority.color || 'blue';
    }
  }
};
</script>

<style scoped>
.v-chip {
  height: 24px;
}
</style>