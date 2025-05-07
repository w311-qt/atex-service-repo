<!-- client/src/views/Login.vue -->
<template>
  <v-container fluid fill-height class="login-page">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 rounded-lg">
          <v-card-title class="headline primary white--text py-4 justify-center">
            <v-img src="@/assets/logo.png" max-width="40" class="mr-2"></v-img>
            ATEX-Электро: Система Учета и Заявок
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
          <span class="text-body-2 grey--text text--darken-1">© {{ new Date().getFullYear() }} ATEX-Электро. Все права защищены</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// Modified Login.vue script section
export default {
  name: 'Login',

  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      isLoading: false,
      errorMessage: ''
    };
  },

  computed: {
    isFormValid() {
      return this.email && this.password;
    }
  },

  methods: {
    async onSubmit() {
      // Всегда считаем форму валидной
      this.loading = true;

      setTimeout(() => {
        // Имитируем успешный вход
        this.$store.dispatch('auth/login', {
          email: this.email || 'test@example.com',
          password: this.password || 'password'
        })
          .then(() => {
            // Перенаправляем на главную
            this.$router.push('/');
          })
          .finally(() => {
            this.loading = false;
          });
      }, 500); // Добавляем небольшую задержку для реалистичности
    },
    mounted() {
      // Автоматически перенаправляем на главную через 1 секунду
      setTimeout(() => {
        this.$router.push('/');
      }, 1000);
    }
  }
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
