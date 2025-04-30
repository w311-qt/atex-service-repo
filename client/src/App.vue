<template>
  <v-app>
    <router-view />

    <!-- Глобальные уведомления -->
    <v-snackbar
      v-for="(notification, index) in notifications"
      :key="index"
      :value="true"
      :color="notification.type"
      :timeout="notification.timeout"
      :style="`bottom: ${index * 60 + 8}px`"
      absolute
      bottom
      right
    >
      {{ notification.message }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="removeNotification(notification.id)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'App',

  computed: {
    ...mapState('notification', ['notifications'])
  },

  methods: {
    ...mapMutations('notification', ['REMOVE_NOTIFICATION']),

    removeNotification(id) {
      this.REMOVE_NOTIFICATION(id)
    }
  }
}
</script>

<style>
/* Глобальные стили */
html {
  overflow-y: auto;
}

.cursor-pointer {
  cursor: pointer;
}

/* Стили для печати */
@media print {
  .v-app-bar,
  .v-navigation-drawer,
  .v-footer,
  .no-print {
    display: none !important;
  }

  .v-main {
    padding: 0 !important;
  }
}
</style>