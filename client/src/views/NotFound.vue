<template>
  <v-container fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <v-card class="pa-6">
          <v-card-title class="text-h4 mb-4">404</v-card-title>
          <v-card-subtitle class="text-h6 mb-4">Страница не найдена</v-card-subtitle>
          <v-img
            src="@/assets/404.svg"
            alt="Страница не найдена"
            max-height="300"
            contain
            class="mb-4"
          ></v-img>
          <v-card-text>
            <p class="mb-4">Запрашиваемая страница не существует или была перемещена.</p>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              color="primary"
              elevation="2"
              :to="{ name: 'Dashboard' }"
            >
              Вернуться на главную
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>