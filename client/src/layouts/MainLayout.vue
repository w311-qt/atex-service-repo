<!-- client/src/layouts/MainLayout.vue -->
<template>
  <v-app>
    <!-- App Bar (верхняя панель) -->
    <v-app-bar color="primary" dark app flat>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="ml-0 pl-3">
        <span>ATEX</span>
        <span class="font-weight-light">Оборудование</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Поисковая строка -->
      <v-text-field
        v-if="isLoggedIn"
        class="mt-7 hidden-sm-and-down"
        flat
        hide-details
        prepend-inner-icon="mdi-magnify"
        label="Поиск..."
        solo-inverted
        rounded
        dense
      ></v-text-field>

      <v-spacer></v-spacer>

      <!-- Уведомления -->
      <v-badge
        v-if="isLoggedIn"
        :content="notificationsCount"
        :value="notificationsCount"
        color="error"
        overlap
      >
        <v-btn icon>
          <v-icon>mdi-bell</v-icon>
        </v-btn>
      </v-badge>

      <!-- Пользовательское меню -->
      <v-menu
        v-if="isLoggedIn"
        bottom
        left
        offset-y
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="ml-2"
            min-width="0"
            text
            v-bind="attrs"
            v-on="on"
          >
            <v-avatar size="32" color="blue lighten-2" class="mr-2">
              <span class="white--text">{{ userInitials }}</span>
            </v-avatar>
            <span class="hidden-sm-and-down">{{ userName }}</span>
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="onProfile">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Профиль</v-list-item-title>
          </v-list-item>
          <v-list-item @click="onSettings">
            <v-list-item-icon>
              <v-icon>mdi-cog</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Настройки</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="onLogout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Выйти</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Боковое меню -->
    <v-navigation-drawer
      v-model="drawer"
      app
      class="pt-4"
      :mini-variant.sync="mini"
    >
      <v-list nav>
        <v-list-item>
          <v-list-item-avatar>
            <v-img src="@/assets/logo.png"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-h6">ATEX-Электро</v-list-item-title>
            <v-list-item-subtitle>ИТ-Инвентаризация</v-list-item-subtitle>
          </v-list-item-content>
          <v-btn
            icon
            @click.stop="mini = !mini"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Навигационные элементы -->
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append v-if="isAdmin">
        <div class="pa-2">
          <v-btn block text>
            <v-icon left>mdi-cog</v-icon>
            Администрирование
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Основной контент -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- Нижняя панель -->
    <v-footer app color="transparent" height="48" inset>
      <span class="text-caption grey--text">
        &copy; {{ new Date().getFullYear() }} ATEX-Электро
      </span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'MainLayout',

  data() {
    return {
      drawer: true,
      mini: false,
      menuItems: [
        {
          title: 'Дашборд',
          icon: 'mdi-view-dashboard',
          path: '/'
        },
        {
          title: 'Оборудование',
          icon: 'mdi-desktop-classic',
          path: '/equipment'
        },
        {
          title: 'Заявки',
          icon: 'mdi-clipboard-text',
          path: '/requests'
        },
        {
          title: 'Категории',
          icon: 'mdi-shape',
          path: '/categories'
        },
        {
          title: 'Пользователи',
          icon: 'mdi-account-group',
          path: '/users'
        },
        {
          title: 'Отчеты',
          icon: 'mdi-chart-bar',
          path: '/reports'
        }
      ],
      notificationsCount: 3
    };
  },

  computed: {
    isLoggedIn() {
      // Здесь будет проверка аутентификации через Vuex
      return true;
    },

    isAdmin() {
      // Проверка роли пользователя
      return true;
    },

    userName() {
      // Получение имени пользователя из Vuex
      return 'Иван Иванов';
    },

    userInitials() {
      // Получение инициалов из имени пользователя
      const name = this.userName;
      if (!name) return '';

      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`;
      }
      return name[0] || '';
    }
  },

  methods: {
    onProfile() {
      // Переход к профилю пользователя
      this.$router.push('/profile');
    },

    onSettings() {
      // Переход к настройкам
      this.$router.push('/settings');
    },

    onLogout() {
      // Выход из системы
      console.log('Logout clicked');
      // Здесь будет логика выхода из системы
    }
  }
};
</script>

<style scoped>
.v-list-item {
  min-height: 40px;
}
</style>
