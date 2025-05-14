<template>
  <v-dialog v-model="dialogVisible" max-width="800px" persistent>
    <v-card>
      <v-card-title class="headline">
        {{ editMode ? 'Редактировать оборудование' : 'Добавить оборудование' }}
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.name"
                  :rules="nameRules"
                  label="Наименование*"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.inventoryNumber"
                  :rules="inventoryNumberRules"
                  label="Инвентарный номер*"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.model"
                  label="Модель"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.categoryId"
                  :items="categories"
                  :rules="categoryRules"
                  item-text="name"
                  item-value="id"
                  label="Категория*"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.statusId"
                  :items="statuses"
                  :rules="statusRules"
                  item-text="name"
                  item-value="id"
                  label="Статус*"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.location"
                  label="Местоположение"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <!-- Исправленный датапикер -->
                <v-menu
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="displayDate"
                      label="Дата поступления"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formData.purchaseDate"
                    @input="dateMenu = false"
                    locale="ru"
                    first-day-of-week="1"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Описание"
                  rows="3"
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
        <v-btn color="blue darken-1" text @click="save" :disabled="!valid || loading" :loading="loading">
          Сохранить
        </v-btn>
      </v-card-actions>

      <!-- Показать ошибку, если есть -->
      <v-snackbar
        v-model="showError"
        color="error"
        :timeout="3000"
      >
        {{ errorMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="showError = false"
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
  name: 'EquipmentFormDialog',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    editMode: {
      type: Boolean,
      default: false
    },
    equipment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.dialog,
      valid: true,
      loading: false,
      dateMenu: false,
      showError: false,
      errorMessage: '',
      formData: {
        name: '',
        inventoryNumber: '',
        model: '',
        categoryId: '',
        statusId: '',
        location: '',
        purchaseDate: null,
        description: ''
      },
      nameRules: [
        v => !!v || 'Наименование обязательно',
        v => (v && v.length >= 3) || 'Наименование должно содержать минимум 3 символа'
      ],
      inventoryNumberRules: [
        v => !!v || 'Инвентарный номер обязателен',
        v => (v && v.length >= 2) || 'Инвентарный номер должен содержать минимум 2 символа'
      ],
      categoryRules: [
        v => !!v || 'Категория обязательна'
      ],
      statusRules: [
        v => !!v || 'Статус обязателен'
      ]
    };
  },
  computed: {
    ...mapGetters('equipment', [
      'allCategories',
      'allStatuses'
    ]),
    categories() {
      return this.allCategories || [];
    },
    statuses() {
      return this.allStatuses || [];
    },
    displayDate() {
      if (!this.formData.purchaseDate) return '';

      // Форматируем дату для отображения
      try {
        const date = new Date(this.formData.purchaseDate);
        return new Intl.DateTimeFormat('ru-RU').format(date);
      } catch (e) {
        // Если дата в формате YYYY-MM-DD
        const [year, month, day] = this.formData.purchaseDate.split('-');
        if (year && month && day) {
          return `${day}.${month}.${year}`;
        }
        return this.formData.purchaseDate;
      }
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
    equipment: {
      handler(newVal) {
        if (newVal) {
          this.formData = {
            name: newVal.name || '',
            inventoryNumber: newVal.inventoryNumber || '',
            model: newVal.model || '',
            categoryId: newVal.categoryId || '',
            statusId: newVal.statusId || '',
            location: newVal.location || '',
            purchaseDate: newVal.purchaseDate || null,
            description: newVal.description || ''
          };
        } else {
          this.resetForm();
        }
      },
      immediate: true
    }
  },
  created() {
    if (this.categories.length === 0) {
      this.$store.dispatch('equipment/fetchCategories');
    }
    if (this.statuses.length === 0) {
      this.$store.dispatch('equipment/fetchStatuses');
    }
  },
  methods: {
    close() {
      this.dialogVisible = false;
      this.resetForm();
    },
    resetForm() {
      this.formData = {
        name: '',
        inventoryNumber: '',
        model: '',
        categoryId: '',
        statusId: '',
        location: '',
        purchaseDate: null,
        description: ''
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
      this.showError = false;
    },
    async save() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          const equipmentData = { ...this.formData };

          console.log('Debug - form data before sending:', equipmentData);

          if (!equipmentData.categoryId) {
            throw new Error('Выберите допустимую категорию');
          }

          if (!equipmentData.statusId) {
            throw new Error('Выберите допустимый статус');
          }

          if (this.editMode && this.equipment) {
            await this.$store.dispatch('equipment/updateEquipment', {
              id: this.equipment.id,
              equipmentData
            });
          } else {
            await this.$store.dispatch('equipment/createEquipment', equipmentData);
          }

          this.$emit('saved');
          this.close();
        } catch (error) {
          console.error('Error saving equipment:', error);
          this.errorMessage = error.response?.data?.message || error.message || 'Ошибка при сохранении';
          this.showError = true;
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>