<template>
  <v-app>
    <v-app-bar color="primary" dark app flat>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="ml-0 pl-3">
        <span>ATЭКС-Электро</span>
        <span class="font-weight-light"></span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>

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
            <v-list-item-title class="text-h6">ATЭКС-Электро</v-list-item-title>
            <v-list-item-subtitle>Инвентаризация</v-list-item-subtitle>
          </v-list-item-content>
          <v-btn
            icon
            @click.stop="mini = !mini"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

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

    <v-main>
      <v-container fluid class="pa-4">
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app color="transparent" height="48" inset>
      <span class="text-caption grey--text">
        &copy; {{ new Date().getFullYear() }} ATЭКС-Электро
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
          title: 'Обзорная панель',
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
      return true;
    },

    isAdmin() {
      return true;
    },

    userName() {
      return 'Арсений Гумаров';
    },

    userInitials() {
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
      this.$router.push('/profile');
    },

    onSettings() {
      this.$router.push('/settings');
    },

    onLogout() {
      console.log('Logout clicked');
    }
  }
};
</script>

<style scoped>
.v-list-item {
  min-height: 40px;
}
</style>
