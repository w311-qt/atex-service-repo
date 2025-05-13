<template>
  <v-container fluid fill-height class="login-page">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 rounded-lg">
          <v-card-title class="headline primary white--text py-4 justify-center">
            <v-img src="@/assets/logo.png" max-width="40" class="mr-2"></v-img>
            АТЭКС-Электро
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form @submit.prevent="login" ref="form">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                required
                outlined
                dense
              ></v-text-field>

              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Пароль"
                name="password"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                outlined
                dense
              ></v-text-field>

              <v-alert
                v-if="errorMessage"
                type="error"
                dense
                text
                dismissible
                class="mt-4"
              >
                {{ errorMessage }}
              </v-alert>

              <div class="d-flex align-center justify-space-between mt-2">
                <v-checkbox
                  v-model="rememberMe"
                  label="Запомнить меня"
                  color="primary"
                  hide-details
                  dense
                ></v-checkbox>
                <v-btn text small color="primary">Забыли пароль?</v-btn>
              </div>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="isLoading"
              large
              depressed
              @click="login"
              :disabled="!isFormValid"
            >
              Войти в систему
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>

        <div class="text-center mt-4">
          <span class="text-body-2 grey--text text--darken-1">© {{ new Date().getFullYear() }} АТЭКС-Электро. Все права защищены</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Login',

  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      isLoading: false,
      errorMessage: '',

      emailRules: [
        v => !!v || 'Email обязателен',
        v => /.+@.+\..+/.test(v) || 'Email должен быть корректным'
      ],
      passwordRules: [
        v => !!v || 'Пароль обязателен',
        v => v.length >= 6 || 'Пароль должен содержать не менее 6 символов'
      ]
    };
  },

  computed: {
    isFormValid() {
      return this.email && this.password;
    }
  },

  methods: {
    async login() {
      if (!this.$refs.form.validate()) return;

      this.isLoading = true;
      this.errorMessage = '';

      try {
        const response = await this.$store.dispatch('auth/login', {
        email: this.email,
        password: this.password,
        rememberMe: this.rememberMe
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.$router.push('/');
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = error.response?.data?.message || 'Ошибка входа. Проверьте учетные данные.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
