<template>
  <v-dialog v-model="dialogVisible" max-width="600px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Назначение исполнителя</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="formData.userId"
                  :items="technicians"
                  item-text="name"
                  item-value="id"
                  label="Исполнитель"
                  :rules="technicianRules"
                  clearable
                >
                  <template v-slot:item="{ item }">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.position || 'Техник' }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                  <template v-slot:selection="{ item }">
                    {{ item.name }}
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.comment"
                  label="Комментарий"
                  rows="3"
                  placeholder="Добавьте комментарий о назначении исполнителя..."
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
          @click="saveAssignment"
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
export default {
  name: 'AssignRequestDialog',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    requestId: {
      type: String,
      required: true
    },
    currentUserId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.dialog,
      valid: true,
      loading: false,
      formData: {
        userId: this.currentUserId,
        comment: ''
      },
      technicians: [],
      technicianRules: []
    };
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
    currentUserId(newVal) {
      this.formData.userId = newVal;
    }
  },
  created() {
    this.loadTechnicians();
  },
  methods: {
    async loadTechnicians() {
      try {
        // Получаем список техников
        const response = await this.$axios.get('/users/technicians');
        this.technicians = response.data;
      } catch (error) {
        this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке списка техников');
      }
    },

    close() {
      this.dialogVisible = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = {
        userId: this.currentUserId,
        comment: ''
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    async saveAssignment() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          await this.$store.dispatch('requests/assignRequest', {
            id: this.requestId,
            userId: this.formData.userId,
            comment: this.formData.comment
          });

          this.$store.commit('notification/SHOW_SUCCESS', 'Исполнитель успешно назначен');
          this.$emit('assigned');
          this.close();
        } catch (error) {
          const errorMessage = error.message || 'Ошибка при назначении исполнителя';
          this.$store.commit('notification/SHOW_ERROR', errorMessage);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>