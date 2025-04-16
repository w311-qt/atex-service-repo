<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
    persistent
    @keydown.esc="close"
  >
    <v-card>
      <v-card-title class="headline primary white--text">
        Создание новой заявки
        <v-spacer></v-spacer>
        <v-btn icon dark @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-container>
            <v-row>
              <!-- Заголовок заявки -->
              <v-col cols="12">
                <v-text-field
                  v-model="request.title"
                  :rules="titleRules"
                  label="Название заявки"
                  required
                  outlined
                  dense
                ></v-text-field>
              </v-col>

              <!-- Тип заявки -->
              <v-col cols="12" md="4">
                <v-select
                  v-model="request.typeId"
                  :items="types"
                  item-text="name"
                  item-value="id"
                  :rules="requiredRules"
                  label="Тип заявки"
                  required
                  outlined
                  dense
                >
                  <template v-slot:selection="{ item }">
                    <v-chip
                      small
                      :color="getTypeColor(item)"
                      text-color="white"
                    >
                      {{ item.name }}
                    </v-chip>
                  </template>
                  <template v-slot:item="{ item }">
                    <v-chip
                      small
                      :color="getTypeColor(item)"
                      text-color="white"
                      class="mr-2"
                    ></v-chip>
                    {{ item.name }}
                  </template>
                </v-select>
              </v-col>

              <!-- Приоритет заявки -->
              <v-col cols="12" md="4">
                <v-select
                  v-model="request.priorityId"
                  :items="priorities"
                  item-text="name"
                  item-value="id"
                  :rules="requiredRules"
                  label="Приоритет"
                  required
                  outlined
                  dense
                >
                  <template v-slot:selection="{ item }">
                    <v-chip
                      small
                      :color="getPriorityColor(item)"
                      text-color="white"
                    >
                      {{ item.name }}
                    </v-chip>
                  </template>
                  <template v-slot:item="{ item }">
                    <v-chip
                      small
                      :color="getPriorityColor(item)"
                      text-color="white"
                      class="mr-2"
                    ></v-chip>
                    {{ item.name }}
                  </template>
                </v-select>
              </v-col>

              <!-- Местоположение -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="request.location"
                  label="Местоположение"
                  hint="Офис, кабинет, отдел и т.д."
                  outlined
                  dense
                ></v-text-field>
              </v-col>

              <!-- Оборудование -->
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="request.equipmentId"
                  :items="equipment"
                  item-text="displayName"
                  item-value="id"
                  label="Оборудование"
                  placeholder="Начните вводить для поиска..."
                  outlined
                  dense
                  :loading="loadingEquipment"
                  :search-input.sync="equipmentSearch"
                  hide-selected
                  clearable
                  no-filter
                  @focus="onEquipmentFocus"
                  @blur="onEquipmentBlur"
                >
                  <template v-slot:item="{ item }">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.name }} ({{ item.inventoryNumber }})</v-list-item-title>
                      <v-list-item-subtitle>{{ item.category?.name }} | {{ item.status?.name }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </v-col>

              <!-- Модель картриджа (показывается только для заявок типа "Заправка картриджа") -->
              <v-col cols="12" md="6" v-if="isCartridgeRefillRequest">
                <v-text-field
                  v-model="request.cartridgeModel"
                  :rules="isCartridgeRefillRequest ? requiredRules : []"
                  label="Модель картриджа"
                  hint="Укажите модель картриджа для заправки"
                  required
                  outlined
                  dense
                ></v-text-field>
              </v-col>

              <!-- Описание заявки -->
              <v-col cols="12">
                <v-textarea
                  v-model="request.description"
                  label="Описание"
                  hint="Подробно опишите проблему или требуемые действия"
                  outlined
                  auto-grow
                  rows="4"
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
          :disabled="!valid || loading"
          :loading="loading"
          @click="save"
        >
          Создать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import debounce from 'lodash/debounce';

export default {
  name: 'RequestCreateDialog',
  data() {
    return {
      dialog: true,
      valid: false,
      loading: false,
      loadingEquipment: false,
      equipment: [],
      equipmentSearch: null,
      request: {
        title: '',
        description: '',
        typeId: '',
        priorityId: '',
        equipmentId: null,
        cartridgeModel: '',
        location: '',
      },
      titleRules: [
        v => !!v || 'Название заявки обязательно',
        v => (v && v.length >= 3) || 'Название должно быть не менее 3 символов',
      ],
      requiredRules: [
        v => !!v || 'Поле обязательно для заполнения',
      ],
    };
  },
  computed: {
    ...mapGetters({
      types: 'requests/getTypes',
      priorities: 'requests/getPriorities',
      currentUser: 'auth/getUser',
    }),
    isCartridgeRefillRequest() {
      // Предполагаем, что у нас есть тип заявки "Заправка картриджа"
      const cartridgeType = this.types.find(type => type.name === 'Заправка картриджа');
      return this.request.typeId === (cartridgeType?.id || '');
    }
  },
  created() {
    // При создании компонента выбираем тип и приоритет по умолчанию, если они доступны
    this.$nextTick(() => {
      if (this.types.length > 0) {
        this.request.typeId = this.types[0].id;
      }

      // Выбираем средний приоритет по умолчанию
      if (this.priorities.length > 0) {
        const mediumPriority = this.priorities.find(p => p.name === 'Средний');
        this.request.priorityId = mediumPriority?.id || this.priorities[0].id;
      }
    });

    // Настраиваем функцию дебаунса для поиска оборудования
    this.debouncedSearchEquipment = debounce(this.searchEquipment, 300);
  },
  watch: {
    equipmentSearch(val) {
      if (val) {
        this.debouncedSearchEquipment(val);
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },

    async save() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;
      try {
        await this.$store.dispatch('requests/createRequest', this.request);
        this.$emit('created');
      } catch (error) {
        this.$store.dispatch('notifications/showError',
          error.response?.data?.message || 'Ошибка при создании заявки'
        );
      } finally {
        this.loading = false;
      }
    },

    getTypeColor(type) {
      return type?.color || '#757575';
    },

    getPriorityColor(priority) {
      return priority?.color || '#757575';
    },

    async onEquipmentFocus() {
      // При фокусе на поле загружаем начальный список оборудования
      if (this.equipment.length === 0) {
        await this.searchEquipment('');
      }
    },

    onEquipmentBlur() {
      // Можно добавить логику, если необходимо
    },

    async searchEquipment(query) {
      this.loadingEquipment = true;
      try {
        const response = await this.$store.dispatch('equipment/searchEquipment', {
          search: query,
          limit: 10
        });

        this.equipment = response.data.map(item => ({
          ...item,
          displayName: `${item.name} (${item.inventoryNumber})`
        }));
      } catch (error) {
        console.error('Error searching equipment:', error);
      } finally {
        this.loadingEquipment = false;
      }
    }
  }
};
</script>