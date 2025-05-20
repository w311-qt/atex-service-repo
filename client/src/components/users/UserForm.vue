<template>
  <v-dialog v-model="dialogVisible" max-width="600px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">{{ isEditing ? 'Редактирование пользователя' : 'Добавление пользователя' }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  :rules="nameRules"
                  label="ФИО пользователя*"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.email"
                  :rules="emailRules"
                  label="Email*"
                  type="email"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.department"
                  label="Отдел"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.position"
                  label="Должность"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.role"
                  :items="roles"
                  label="Роль*"
                  required
                  :rules="roleRules"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-switch
                  v-model="formData.isActive"
                  label="Активный пользователь"
                  color="success"
                ></v-switch>
              </v-col>

              <v-col cols="12" v-if="!isEditing">
                <v-text-field
                  v-model="formData.password"
                  :rules="passwordRules"
                  label="Пароль*"
                  type="password"
                  hint="Пароль должен содержать не менее 8 символов, включая минимум 1 заглавную букву, 1 строчную букву, 1 цифру и 1 спец. символ"
                  required
                ></v-text-field>
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
export default {
  name: 'UserForm',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    editMode: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: this.dialog,
      valid: true,
      loading: false,
      formData: {
        name: '',
        email: '',
        password: '',
        role: 'user',
        department: '',
        position: '',
        isActive: true
      },
      nameRules: [
        v => !!v || 'ФИО обязательно',
        v => (v && v.length >= 2) || 'ФИО должно содержать минимум 2 символа'
      ],
      emailRules: [
        v => !!v || 'Email обязателен',
        v => /.+@.+\..+/.test(v) || 'Email должен быть корректным'
      ],
      passwordRules: [
        v => !this.isEditing || !!v || 'Пароль обязателен',
        v => this.isEditing || (v && v.length >= 8) || 'Пароль должен содержать минимум 8 символов',
        v => this.isEditing || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v) ||
          'Пароль должен содержать минимум 1 заглавную букву, 1 строчную букву, 1 цифру и 1 спец. символ'
      ],
      roleRules: [
        v => !!v || 'Роль обязательна'
      ],
      roles: [
        { text: 'Администратор', value: 'admin' },
        { text: 'Техник', value: 'technician' },
        { text: 'Пользователь', value: 'user' }
      ]
    };
  },
  computed: {
    isEditing() {
      return this.editMode;
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
    user: {
      handler(newVal) {
        if (newVal && this.isEditing) {
          this.formData = {
            name: newVal.name || '',
            email: newVal.email || '',
            role: newVal.role || 'user',
            department: newVal.department || '',
            position: newVal.position || '',
            isActive: newVal.isActive !== undefined ? newVal.isActive : true,
            password: ''
          };
        } else {
          this.resetForm();
        }
      },
      immediate: true
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
        email: '',
        password: '',
        role: 'user',
        department: '',
        position: '',
        isActive: true
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    async save() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          if (this.isEditing) {
            const userData = { ...this.formData };
            if (!userData.password) {
              delete userData.password;
            }

            await this.$store.dispatch('users/updateUser', {
              id: this.user.id,
              userData
            });

            this.$store.commit('notification/SHOW_SUCCESS', 'Пользователь успешно обновлен');
            this.$emit('saved');
            this.close();
          } else {
            try {
              await this.$store.dispatch('users/createUser', this.formData);
              this.$store.commit('notification/SHOW_SUCCESS', 'Пользователь успешно создан');
              this.$emit('saved');
              this.close();
            } catch (createError) {
              if (createError.response?.status === 409) {
                this.$store.commit('notification/SHOW_ERROR', 'Пользователь с таким email уже существует');
                this.emailRules.push(() => false || 'Этот email уже используется');
                this.$refs.form.validate();
              } else {
                const errorMessage = createError.response?.data?.message || 'Ошибка при создании пользователя';
                this.$store.commit('notification/SHOW_ERROR', errorMessage);
              }
              throw createError;
            }
          }
        } catch (error) {
          console.error('Error saving user:', error);
        } finally {
          this.loading = false;
        }
      }
    }
  }
};
</script>