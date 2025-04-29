<template>
  <v-dialog v-model="dialogVisible" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Создание новой заявки</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.title"
                  :rules="titleRules"
                  label="Тема заявки*"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.typeId"
                  :items="requestTypes"
                  :rules="typeRules"
                  item-text="name"
                  item-value="id"
                  label="Тип заявки*"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.priorityId"
                  :items="requestPriorities"
                  :rules="priorityRules"
                  item-text="name"
                  item-value="id"
                  label="Приоритет*"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.equipmentId"
                  :items="equipmentList"
                  item-text="name"
                  item-value="id"
                  label="Оборудование"
                  clearable
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.location"
                  label="Местоположение"
                ></v-text-field>
              </v-col>

              <!-- Показывать только для заявок типа "Заправка картриджа" -->
              <v-col cols="12" sm="6" v-if="isCartridgeRefillType">
                <v-text-field
                  v-model="formData.cartridgeModel"
                  label="Модель картриджа*"
                  :rules="cartridgeModelRules"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Описание заявки"
                  rows="4"
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
          @click="save"
          :disabled="!valid || loading"
          :loading="loading"
        >
          Создать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'RequestCreateDialog',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    equipmentId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.dialog,
      valid: true,
      loading: false,
      cartridgeRefillTypeId: null, // Будет заполнено при инициализации
      formData: {
        title: '',
        typeId: '',
        priorityId: '',
        equipmentId: this.equipmentId || null,
        cartridgeModel: '',
        location: '',
        description: ''
      },
      titleRules: [
        v => !!v || 'Тема заявки обязательна',
        v => (v && v.length >= 5) || 'Тема должна содержать минимум 5 символов'
      ],
      typeRules: [
        v => !!v || 'Тип заявки обязателен'
      ],
      priorityRules: [
        v => !!v || 'Приоритет обязателен'
      ],
      cartridgeModelRules: [
        v => !this.isCartridgeRefillType || !!v || 'Укажите модель картриджа'
      ]
    };
  },
  computed: {
    ...mapGetters('requests', [
      'allRequestTypes',
      'allRequestPriorities'
    ]),
    ...mapGetters('equipment', [
      'allEquipment'
    ]),
    requestTypes() {
      return this.allRequestTypes || [];
    },
    requestPriorities() {
      return this.allRequestPriorities || [];
    },
    equipmentList() {
      return this.allEquipment || [];
    },
    isCartridgeRefillType() {
      if (!this.cartridgeRefillTypeId || !this.formData.typeId) return false;
      return this.formData.typeId === this.cartridgeRefillTypeId;
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
    equipmentId(newVal) {
      this.formData.equipmentId = newVal;
    }
  },
  created() {
    // Загружаем все необходимые данные
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        // Загружаем типы заявок
        if (this.requestTypes.length === 0) {
          await this.$store.dispatch('requests/fetchRequestTypes');
        }

        // Загружаем приоритеты заявок
        if (this.requestPriorities.length === 0) {
          await this.$store.dispatch('requests/fetchRequestPriorities');
        }

        // Загружаем оборудование
        if (this.equipmentList.length === 0) {
          await this.$store.dispatch('equipment/fetchEquipment');
        }

        // Находим ID типа заявки "Заправка картриджа"
        this.findCartridgeRefillTypeId();
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке данных');
      }
    },

    findCartridgeRefillTypeId() {
      const cartridgeRefillType = this.requestTypes.find(type =>
        type.name.toLowerCase().includes('заправка картридж')
      );
      if (cartridgeRefillType) {
        this.cartridgeRefillTypeId = cartridgeRefillType.id;
      }
    },

    close() {
      this.dialogVisible = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = {
        title: '',
        typeId: '',
        priorityId: '',
        equipmentId: this.equipmentId || null,
        cartridgeModel: '',
        location: '',
        description: ''
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    async save() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          await this.$store.dispatch('requests/createRequest', this.formData);
          this.$store.commit('notification/SHOW_SUCCESS', 'Заявка успешно создана');
          this.$emit('saved');
          this.close();
        } catch (error) {
          const errorMessage = error.message || 'Ошибка при создании заявки';
          this.$store.commit('notification/SHOW_ERROR', errorMessage);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>
