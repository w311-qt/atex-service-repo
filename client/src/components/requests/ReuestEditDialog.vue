<template>
  <v-dialog v-model="dialogVisible" max-width="600px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Редактирование заявки</span>
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
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'RequestEditDialog',
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: true,
      valid: true,
      loading: false,
      cartridgeRefillTypeId: null,
      formData: {
        title: '',
        typeId: '',
        priorityId: '',
        equipmentId: null,
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
  created() {
    this.loadData();
    this.initFormData();
  },
  methods: {
    async loadData() {
      try {
        if (this.requestTypes.length === 0) {
          await this.$store.dispatch('requests/fetchRequestTypes');
        }

        if (this.requestPriorities.length === 0) {
          await this.$store.dispatch('requests/fetchRequestPriorities');
        }

        if (this.equipmentList.length === 0) {
          await this.$store.dispatch('equipment/fetchEquipment');
        }

        this.findCartridgeRefillTypeId();
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке данных');
      }
    },

    initFormData() {
      if (this.request) {
        this.formData = {
          title: this.request.title || '',
          typeId: this.request.typeId || '',
          priorityId: this.request.priorityId || '',
          equipmentId: this.request.equipmentId || null,
          cartridgeModel: this.request.cartridgeModel || '',
          location: this.request.location || '',
          description: this.request.description || ''
        };
      }
    },

    findCartridgeRefillTypeId() {
      const cartridgeRefillType = this.requestTypes.find(type =>
        type.name.toLowerCase().includes('заправк') || type.name.toLowerCase().includes('картридж')
      );
      if (cartridgeRefillType) {
        this.cartridgeRefillTypeId = cartridgeRefillType.id;
      }
    },

    close() {
      this.dialogVisible = false;
      this.$emit('close');
    },

    async save() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          await this.$store.dispatch('requests/updateRequest', {
            id: this.request.id,
            requestData: this.formData
          });
          this.$store.commit('notification/SHOW_SUCCESS', 'Заявка успешно обновлена');
          this.$emit('updated');
          this.close();
        } catch (error) {
          const errorMessage = error.message || 'Ошибка при обновлении заявки';
          this.$store.commit('notification/SHOW_ERROR', errorMessage);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>