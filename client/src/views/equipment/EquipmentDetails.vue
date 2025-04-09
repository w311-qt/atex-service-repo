<!-- client/src/views/equipment/EquipmentDetails.vue -->
<template>
  <div>
    <v-skeleton-loader
      v-if="loading"
      type="card, list-item-three-line, divider, paragraph, card-heading"
    ></v-skeleton-loader>

    <div v-else>
      <!-- Заголовок и кнопки управления -->
      <v-card flat class="mb-4">
        <v-card-title class="d-flex align-center py-2">
          <v-btn
            icon
            color="grey darken-1"
            class="mr-3"
            @click="$router.go(-1)"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h5">{{ equipment.name }}</h1>
          <v-chip
            :color="getStatusColor(equipment.status)"
            class="ml-4"
            small
            text-color="white"
          >
            {{ equipment.status?.name || 'Статус не указан' }}
          </v-chip>
          <v-spacer></v-spacer>

          <v-btn
            color="primary"
            text
            class="mr-2"
            @click="openCreateRequestDialog"
          >
            <v-icon left>mdi-clipboard-plus</v-icon>
            Создать заявку
          </v-btn>

          <v-btn
            color="success"
            text
            class="mr-2"
            @click="editEquipment"
          >
            <v-icon left>mdi-pencil</v-icon>
            Редактировать
          </v-btn>

          <v-btn
            color="error"
            text
            @click="deleteEquipment"
          >
            <v-icon left>mdi-delete</v-icon>
            Удалить
          </v-btn>
        </v-card-title>
      </v-card>

      <v-row>
        <!-- Основная информация и фото -->
        <v-col cols="12" md="8">
          <v-card outlined class="mb-4">
            <v-card-title class="py-2 grey lighten-4">
              <v-icon left color="primary">mdi-information</v-icon>
              Основная информация
            </v-card-title>

            <v-card-text class="py-3">
              <v-row>
                <v-col cols="12" md="6">
                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Инвентарный номер</v-list-item-subtitle>
                      <v-list-item-title class="subtitle-1">{{ equipment.inventoryNumber }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Модель</v-list-item-subtitle>
                      <v-list-item-title class="subtitle-1">{{ equipment.model || 'Не указана' }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Категория</v-list-item-subtitle>
                      <v-list-item-title class="subtitle-1">{{ equipment.category?.name || 'Не указана' }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Ответственный</v-list-item-subtitle>
                      <v-list-item-title v-if="equipment.assignedTo" class="subtitle-1">
                        {{ equipment.assignedTo.name }} ({{ equipment.assignedTo.department }})
                      </v-list-item-title>
                      <v-list-item-title v-else class="subtitle-1">
                        <span class="grey--text">Не назначен</span>
                        <v-btn
                          x-small
                          text
                          color="primary"
                          class="ml-2"
                          @click="assignEquipment"
                        >
                          Назначить
                        </v-btn>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-col>

                <v-col cols="12" md="6">
                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Статус</v-list-item-subtitle>
                      <v-list-item-title class="subtitle-1">
                        <v-chip
                          :color="getStatusColor(equipment.status)"
                          x-small
                          text-color="white"
                          class="mr-2"
                        >
                          {{ equipment.status?.name || 'Не указан' }}
                        </v-chip>
                        <v-btn
                          x-small
                          text
                          color="primary"
                          @click="changeStatus"
                        >
                          Изменить
                        </v-btn>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Местоположение</v-list-item-subtitle>
                      <v-list-item-title class="subtitle-1">{{ equipment.location || 'Не указано' }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Дата поступления</v-list-item-subtitle>
                      <v-list-item-title class="subtitle-1">{{ formatDate(equipment.purchaseDate) }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="text-caption grey--text">Добавлено</v-list-item-subtitle>
                      <v-list-item-title class="subtitle-1">{{ formatDate(equipment.createdAt) }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Описание -->
          <v-card outlined class="mb-4">
            <v-card-title class="py-2 grey lighten-4">
              <v-icon left color="primary">mdi-text-box</v-icon>
              Описание
            </v-card-title>

            <v-card-text class="py-3">
              <div v-if="equipment.description">{{ equipment.description }}</div>
              <div v-else class="grey--text">Описание отсутствует</div>
            </v-card-text>
          </v-card>

          <!-- Технические характеристики -->
          <v-card outlined class="mb-4">
            <v-card-title class="py-2 grey lighten-4 d-flex justify-space-between">
              <div>
                <v-icon left color="primary">mdi-clipboard-list</v-icon>
                Технические характеристики
              </div>
              <v-btn
                small
                text
                color="primary"
                @click="editSpecifications"
              >
                <v-icon left>mdi-pencil</v-icon>
                Редактировать
              </v-btn>
            </v-card-title>

            <v-card-text class="py-0" v-if="equipment.specifications && equipment.specifications.length">
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                  <tr>
                    <th class="text-left">Характеристика</th>
                    <th class="text-left">Значение</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="spec in equipment.specifications" :key="spec.id">
                    <td>{{ spec.key }}</td>
                    <td>{{ spec.value }}{{ spec.unit ? ' ' + spec.unit : '' }}</td>
                  </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>

            <v-card-text v-else class="py-3">
              <div class="grey--text">Технические характеристики не указаны</div>
            </v-card-text>
          </v-card>

          <!-- История заявок -->
          <v-card outlined>
            <v-card-title class="py-2 grey lighten-4">
              <v-icon left color="primary">mdi-history</v-icon>
              История заявок
            </v-card-title>

            <v-card-text class="py-0" v-if="equipmentRequests.length">
              <v-timeline dense>
                <v-timeline-item
                  v-for="request in equipmentRequests"
                  :key="request.id"
                  :color="getRequestStatusColor(request.status)"
                  small
                >
                  <div class="d-flex justify-space-between">
                    <div>
                      <div class="subtitle-1">
                        <router-link
                          :to="`/requests/${request.id}`"
                          class="text-decoration-none"
                        >
                          {{ request.number }} - {{ request.title }}
                        </router-link>
                        <v-chip
                          :color="getRequestStatusColor(request.status)"
                          x-small
                          text-color="white"
                          class="ml-2"
                        >
                          {{ request.status.name }}
                        </v-chip>
                      </div>
                      <div class="text-caption grey--text">
                        {{ formatDateTime(request.createdAt) }} • {{ request.type.name }}
                      </div>
                    </div>
                    <div>
                      <v-chip
                        :color="getRequestPriorityColor(request.priority)"
                        outlined
                        x-small
                      >
                        {{ request.priority.name }}
                      </v-chip>
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>

            <v-card-text v-else class="py-3">
              <div class="grey--text">Нет связанных заявок</div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Фото и QR-код -->
        <v-col cols="12" md="4">
          <v-card outlined class="mb-4">
            <v-card-title class="py-2 grey lighten-4 d-flex justify-space-between">
              <div>
                <v-icon left color="primary">mdi-image</v-icon>
                Изображение
              </div>
              <v-btn
                small
                text
                color="primary"
                @click="uploadImage"
              >
                <v-icon left>mdi-upload</v-icon>
                Загрузить
              </v-btn>
            </v-card-title>

            <v-card-text class="d-flex justify-center pa-6">
              <v-img
                v-if="equipment.image"
                :src="`/api/files/${equipment.image}`"
                max-height="300"
                contain
                class="rounded"
              ></v-img>
              <div v-else class="d-flex flex-column align-center justify-center grey lighten-4 rounded" style="height: 200px; width: 100%;">
                <v-icon size="64" color="grey lighten-1">mdi-image-off</v-icon>
                <div class="mt-2 grey--text text--darken-1">Изображение отсутствует</div>
              </div>
            </v-card-text>
          </v-card>

          <v-card outlined class="mb-4">
            <v-card-title class="py-2 grey lighten-4">
              <v-icon left color="primary">mdi-qrcode</v-icon>
              QR-код
            </v-card-title>

            <v-card-text class="d-flex justify-center pa-6">
              <!-- Здесь будет QR-код с инвентарным номером -->
              <div class="text-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Equipment:INV-2023-1001"
                  alt="QR Code"
                  class="rounded"
                />
                <div class="mt-2 text-caption grey--text">
                  Просканируйте QR-код для быстрого доступа к информации об оборудовании
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card outlined>
            <v-card-title class="py-2 grey lighten-4">
              <v-icon left color="primary">mdi-cog</v-icon>
              Действия
            </v-card-title>

            <v-card-text class="py-3">
              <v-list dense>
                <v-list-item @click="openCreateRequestDialog">
                  <v-list-item-icon>
                    <v-icon color="blue">mdi-clipboard-plus</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Создать заявку</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item @click="assignEquipment">
                  <v-list-item-icon>
                    <v-icon color="green">mdi-account-plus</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Назначить ответственного</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item @click="changeStatus">
                  <v-list-item-icon>
                    <v-icon color="orange">mdi-tag</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Изменить статус</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item @click="printInfo">
                  <v-list-item-icon>
                    <v-icon color="purple">mdi-printer</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Распечатать информацию</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item @click="deleteEquipment">
                  <v-list-item-icon>
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Удалить оборудование</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          Удаление оборудования
        </v-card-title>

        <v-card-text>
          Вы действительно хотите удалить оборудование <strong>{{ equipment.name }}</strong>? Это действие нельзя отменить.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="deleteDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="deleteLoading"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог назначения ответственного -->
    <v-dialog v-model="assignDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          Назначение ответственного
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="selectedUserId"
            :items="userOptions"
            label="Выберите ответственного"
            outlined
            dense
          ></v-select>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="assignDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmAssign"
            :loading="assignLoading"
          >
            Назначить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог изменения статуса -->
    <v-dialog v-model="statusDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          Изменение статуса
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="selectedStatusId"
            :items="statusOptions"
            label="Выберите статус"
            outlined
            dense
          ></v-select>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="statusDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmStatusChange"
            :loading="statusLoading"
          >
            Изменить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'EquipmentDetails',

  data() {
    return {
      loading: true,
      deleteLoading: false,
      assignLoading: false,
      statusLoading: false,
      equipment: {
        id: '',
        name: '',
        inventoryNumber: '',
        model: '',
        description: '',
        category: null,
        status: null,
        assignedTo: null,
        location: '',
        purchaseDate: null,
        image: null,
        createdAt: null,
        updatedAt: null,
        specifications: []
      },
      equipmentRequests: [],

      // Диалоги
      deleteDialog: false,
      assignDialog: false,
      statusDialog: false,

      // Выбранные значения
      selectedUserId: null,
      selectedStatusId: null,

      // Опции для выбора
      userOptions: [
        { text: 'Иванов И.И.', value: '1' },
        { text: 'Петров П.П.', value: '2' },
        { text: 'Сидоров С.С.', value: '3' }
      ],

      statusOptions: [
        { text: 'Новый', value: '1' },
        { text: 'Рабочий', value: '2' },
        { text: 'Дефектный', value: '3' },
        { text: 'Нерабочий', value: '4' }
      ]
    };
  },

  created() {
    this.fetchEquipmentDetails();
  },

  methods: {
    async fetchEquipmentDetails() {
      this.loading = true;

      try {
        // Здесь будет вызов API для получения детальной информации об оборудовании
        // const response = await this.$store.dispatch('equipment/fetchDetails', this.$route.params.id);

        // Имитация задержки запроса
        await new Promise(resolve => setTimeout(resolve, 800));

        // Имитация данных от API
        this.equipment = this.getMockEquipmentDetails();
        this.equipmentRequests = this.getMockEquipmentRequests();
      } catch (error) {
        console.error('Error fetching equipment details:', error);
        this.$toast.error('Ошибка при загрузке данных об оборудовании');
      } finally {
        this.loading = false;
      }
    },

    editEquipment() {
      this.$router.push(`/equipment/${this.equipment.id}/edit`);
    },

    deleteEquipment() {
      this.deleteDialog = true;
    },

    async confirmDelete() {
      this.deleteLoading = true;

      try {
        // Здесь будет вызов API для удаления оборудования
        // await this.$store.dispatch('equipment/delete', this.equipment.id);

        // Имитация задержки запроса
        await new Promise(resolve => setTimeout(resolve, 800));

        this.$toast.success('Оборудование успешно удалено');
        this.$router.push('/equipment');
      } catch (error) {
        console.error('Error deleting equipment:', error);
        this.$toast.error('Ошибка при удалении оборудования');
      } finally {
        this.deleteLoading = false;
        this.deleteDialog = false;
      }
    },

    assignEquipment() {
      this.selectedUserId = this.equipment.assignedTo?.id || null;
      this.assignDialog = true;
    },

    async confirmAssign() {
      this.assignLoading = true;

      try {
        // Здесь будет вызов API для назначения ответственного
        // await this.$store.dispatch('equipment/assign', {
        //   id: this.equipment.id,
        //   userId: this.selectedUserId
        // });

        // Имитация задержки запроса
        await new Promise(resolve => setTimeout(resolve, 800));

        // Обновление данных об оборудовании
        this.fetchEquipmentDetails();
        this.$toast.success('Ответственный успешно назначен');
      } catch (error) {
        console.error('Error assigning user:', error);
        this.$toast.error('Ошибка при назначении ответственного');
      } finally {
        this.assignLoading = false;
        this.assignDialog = false;
      }
    },

    changeStatus() {
      this.selectedStatusId = this.equipment.status?.id || null;
      this.statusDialog = true;
    },

    async confirmStatusChange() {
      this.statusLoading = true;

      try {
        // Здесь будет вызов API для изменения статуса
        // await this.$store.dispatch('equipment/changeStatus', {
        //   id: this.equipment.id,
        //   statusId: this.selectedStatusId
        // });

        // Имитация задержки запроса
        await new Promise(resolve => setTimeout(resolve, 800));

        // Обновление данных об оборудовании
        this.fetchEquipmentDetails();
        this.$toast.success('Статус успешно изменен');
      } catch (error) {
        console.error('Error changing status:', error);
        this.$toast.error('Ошибка при изменении статуса');
      } finally {
        this.statusLoading = false;
        this.statusDialog = false;
      }
    },

    editSpecifications() {
      this.$router.push(`/equipment/${this.equipment.id}/specifications`);
    },

    uploadImage() {
      // Здесь будет открытие диалога загрузки изображения
      // Пока просто заглушка
      this.$toast.info('Функция загрузки изображения будет доступна в следующей версии');
    },

    openCreateRequestDialog() {
      this.$router.push({
        path: '/requests/create',
        query: { equipmentId: this.equipment.id }
      });
    },

    printInfo() {
      window.print();
    },

    formatDate(dateString) {
      if (!dateString) return '—';

      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    },

    formatDateTime(dateString) {
      if (!dateString) return '—';

      const date = new Date(dateString);
      return `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    },

    getStatusColor(status) {
      if (!status) return 'grey';

      const colorMap = {
        'Новый': 'info',
        'Рабочий': 'success',
        'Дефектный': 'warning',
        'Нерабочий': 'error'
      };

      return colorMap[status.name] || 'grey';
    },

    getRequestStatusColor(status) {
      if (!status) return 'grey';

      const colorMap = {
        'Новая': 'info',
        'В работе': 'primary',
        'Ожидает': 'warning',
        'Выполнена': 'success',
        'Отменена': 'error'
      };

      return colorMap[status.name] || 'grey';
    },

    getRequestPriorityColor(priority) {
      if (!priority) return 'grey';

      const colorMap = {
        'Низкий': 'success',
        'Средний': 'info',
        'Высокий': 'warning',
        'Критический': 'error'
      };

      return colorMap[priority.name] || 'grey';
    },

    // Временный метод для имитации данных
    getMockEquipmentDetails() {
      return {
        id: '1',
        name: 'Монитор Dell P2419H',
        inventoryNumber: 'INV-2023-1001',
        model: 'P2419H',
        description: 'Монитор Dell 24" с разрешением 1920x1080, IPS-матрицей и регулируемой подставкой. Поддерживает подключение через DisplayPort и HDMI.',
        category: { id: '1', name: 'Мониторы' },
        status: { id: '2', name: 'Рабочий', color: '#28a745' },
        assignedTo: {
          id: '1',
          name: 'Иванов И.И.',
          department: 'IT',
          position: 'Администратор'
        },
        location: 'Офис 302, рабочее место №5',
        purchaseDate: new Date(2022, 3, 15),
        image: 'equipment-1.jpg',
        createdAt: new Date(2022, 3, 16),
        updatedAt: new Date(2022, 5, 20),
        specifications: [
          { id: '1', key: 'Диагональ', value: '24', unit: 'дюйм' },
          { id: '2', key: 'Разрешение', value: '1920x1080', unit: '' },
          { id: '3', key: 'Тип матрицы', value: 'IPS', unit: '' },
          { id: '4', key: 'Частота обновления', value: '60', unit: 'Гц' },
          { id: '5', key: 'Интерфейсы', value: 'DisplayPort, HDMI, VGA', unit: '' }
        ]
      };
    },

    // Временный метод для имитации данных
    getMockEquipmentRequests() {
      return [
        {
          id: '1',
          number: 'REQ-2023-0001',
          title: 'Настройка монитора',
          status: { id: '4', name: 'Выполнена', color: '#28a745' },
          type: { id: '1', name: 'Ремонт', color: '#dc3545' },
          priority: { id: '2', name: 'Средний', color: '#17a2b8' },
          createdAt: new Date(2023, 1, 10)
        },
        {
          id: '2',
          number: 'REQ-2023-0023',
          title: 'Замена кабеля питания',
          status: { id: '2', name: 'В работе', color: '#007bff' },
          type: { id: '1', name: 'Ремонт', color: '#dc3545' },
          priority: { id: '3', name: 'Высокий', color: '#fd7e14' },
          createdAt: new Date(2023, 3, 5)
        }
      ];
    }
  }
}
</script>
