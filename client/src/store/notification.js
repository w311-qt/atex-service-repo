import { defineStore } from 'pinia';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    nextId: 1
  }),

  actions: {
    showNotification(notification) {
      const id = this.nextId++;

      const newNotification = {
        id,
        type: notification.type || 'info',
        message: notification.message,
        timeout: notification.timeout || 5000
      };

      this.notifications.push(newNotification);

      // Автоматически удаляем уведомление через timeout
      if (newNotification.timeout > 0) {
        setTimeout(() => {
          this.removeNotification(id);
        }, newNotification.timeout);
      }

      return id;
    },

    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },

    clearAllNotifications() {
      this.notifications = [];
    },

    // Методы-помощники для создания уведомлений разных типов
    showSuccess(message, timeout = 5000) {
      return this.showNotification({ type: 'success', message, timeout });
    },

    showError(message, timeout = 8000) {
      return this.showNotification({ type: 'error', message, timeout });
    },

    showWarning(message, timeout = 7000) {
      return this.showNotification({ type: 'warning', message, timeout });
    },

    showInfo(message, timeout = 5000) {
      return this.showNotification({ type: 'info', message, timeout });
    }
  }
});
