<template>
  <v-dialog v-model="dialogVisible" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">{{ editMode ? 'Редактировать оборудование' : 'Добавить оборудование' }}</span>
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
                <v-menu
                  ref="dateMenu"
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  :return-value.sync="formData.purchaseDate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedDate"
                      label="Дата поступления"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="formData.purchaseDate"
                    no-title
                    scrollable
                    @input="dateMenu = false"
                  >
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="dateMenu = false">Отмена</v-btn>
                    <v-btn text color="primary" @click="$refs.dateMenu.save(formData.purchaseDate)">OK</v-btn>
                  </v-date-picker>
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
    formattedDate() {
      if (!this.formData.purchaseDate) return '';
      const [year, month, day] = this.formData.purchaseDate.split('-');
      return `${day}.${month}.${year}`;
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
    },
    async save() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          if (this.editMode && this.equipment) {
            await this.$store.dispatch('equipment/updateEquipment', {
              id: this.equipment.id,
              equipmentData: this.formData
            });
            this.$store.commit('notification/SHOW_SUCCESS', 'Оборудование успешно обновлено');
          } else {
            await this.$store.dispatch('equipment/createEquipment', this.formData);
            this.$store.commit('notification/SHOW_SUCCESS', 'Оборудование успешно добавлено');
          }
          this.$emit('saved');
          this.close();
        } catch (error) {
          const errorMessage = error.message || 'Ошибка при сохранении оборудования';
          this.$store.commit('notification/SHOW_ERROR', errorMessage);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>