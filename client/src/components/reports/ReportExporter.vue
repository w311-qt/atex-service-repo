<template>
  <div class="report-exporter">
    <v-card outlined class="mb-4">
      <v-card-title class="py-2 grey lighten-4">
        <v-icon left color="primary">mdi-file-export</v-icon>
        Экспорт отчетов
      </v-card-title>

      <v-card-text class="pa-4">
        <v-select
          v-model="reportType"
          :items="reportTypes"
          label="Тип отчета"
          @change="resetForm"
        ></v-select>

        <div v-if="reportType === 'equipment'">
          <v-select
            v-model="equipmentParams.categoryIds"
            :items="categories"
            item-text="name"
            item-value="id"
            label="Категории"
            multiple
            chips
            small-chips
          ></v-select>

          <v-select
            v-model="equipmentParams.statusIds"
            :items="statuses"
            item-text="name"
            item-value="id"
            label="Статусы"
            multiple
            chips
            small-chips
          ></v-select>

          <v-menu
            v-model="dateFromMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="equipmentParams.dateFrom"
                label="Дата поступления от"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="equipmentParams.dateFrom"
              no-title
              scrollable
              @input="dateFromMenu = false"
            ></v-date-picker>
          </v-menu>

          <v-menu
            v-model="dateToMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="equipmentParams.dateTo"
                label="Дата поступления до"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="equipmentParams.dateTo"
              no-title
              scrollable
              @input="dateToMenu = false"
            ></v-date-picker>
          </v-menu>
        </div>

        <div v-if="reportType === 'requests'">
          <v-select
            v-model="requestsParams.statusIds"
            :items="requestStatuses"
            item-text="name"
            item-value="id"
            label="Статусы заявок"
            multiple
            chips
            small-chips
          ></v-select>

          <v-select
            v-model="requestsParams.typeIds"
            :items="requestTypes"
            item-text="name"
            item-value="id"
            label="Типы заявок"
            multiple
            chips
            small-chips
          ></v-select>

          <v-select
            v-model="requestsParams.assignedToIds"
            :items="technicians"
            item-text="name"
            item-value="id"
            label="Исполнители"
            multiple
            chips
            small-chips
          ></v-select>

          <v-menu
            v-model="requestDateFromMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="requestsParams.dateFrom"
                label="Дата создания от"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="requestsParams.dateFrom"
              no-title
              scrollable
              @input="requestDateFromMenu = false"
            ></v-date-picker>
          </v-menu>

          <v-menu
            v-model="requestDateToMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="requestsParams.dateTo"
                label="Дата создания до"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="requestsParams.dateTo"
              no-title
              scrollable
              @input="requestDateToMenu = false"
            ></v-date-picker>
          </v-menu>
        </div>

        <v-alert
          v-if="error"
          type="error"
          dense
          class="mt-3"
        >
          {{ error }}
        </v-alert>

        <v-btn
          color="success"
          block
          class="mt-4"
          @click="exportReport"
          :loading="loading"
          :disabled="loading"
        >
          <v-icon left>mdi-file-excel</v-icon>
          Экспорт в Excel
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import reportsService from '@/services/reports.service';

export default {
  name: 'ReportExporter',

  data() {
    return {
      reportType: 'equipment',
      reportTypes: [
        { text: 'Отчет по оборудованию', value: 'equipment' },
        { text: 'Отчет по заявкам', value: 'requests' }
      ],

      // Параметры отчета по оборудованию
      equipmentParams: {
        categoryIds: [],
        statusIds: [],
        dateFrom: null,
        dateTo: null
      },

      // Параметры отчета по заявкам
      requestsParams: {
        statusIds: [],
        typeIds: [],
        assignedToIds: [],
        dateFrom: null,
        dateTo: null
      },

      // Менюшки для дат
      dateFromMenu: false,
      dateToMenu: false,
      requestDateFromMenu: false,
      requestDateToMenu: false,

      error: null,
      loading: false
    };
  },

  computed: {
    ...mapGetters('equipment', [
      'allCategories',
      'allStatuses'
    ]),
    ...mapGetters('requests', [
      'allRequestStatuses',
      'allRequestTypes'
    ]),
    ...mapGetters('users', [
      'allTechnicians'
    ]),

    categories() {
      return this.allCategories || [];
    },

    statuses() {
      return this.allStatuses || [];
    },

    requestStatuses() {
      return this.allRequestStatuses || [];
    },

    requestTypes() {
      return this.allRequestTypes || [];
    },

    technicians() {
      return this.allTechnicians || [];
    }
  },

  created() {
    this.loadReferenceData();
  },

  methods: {
    async loadReferenceData() {
      try {
        // Загружаем справочники, если их еще нет
        if (this.categories.length === 0) {
          await this.$store.dispatch('equipment/fetchCategories');
        }

        if (this.statuses.length === 0) {
          await this.$store.dispatch('equipment/fetchStatuses');
        }

        if (this.requestStatuses.length === 0) {
          await this.$store.dispatch('requests/fetchRequestStatuses');
        }

        if (this.requestTypes.length === 0) {
          await this.$store.dispatch('requests/fetchRequestTypes');
        }

        if (this.technicians.length === 0) {
          await this.$store.dispatch('users/fetchTechnicians');
        }
      } catch (error) {
        console.error('Ошибка при загрузке справочных данных:', error);
        this.error = 'Не удалось загрузить справочные данные';
      }
    },

    resetForm() {
      if (this.reportType === 'equipment') {
        this.equipmentParams = {
          categoryIds: [],
          statusIds: [],
          dateFrom: null,
          dateTo: null
        };
      } else {
        this.requestsParams = {
          statusIds: [],
          typeIds: [],
          assignedToIds: [],
          dateFrom: null,
          dateTo: null
        };
      }

      this.error = null;
    },

    async exportReport() {
      this.error = null;
      this.loading = true;

      try {
        // Use direct service calls instead of the Vuex store
        if (this.reportType === 'equipment') {
          const blob = await reportsService.exportEquipmentReport(this.equipmentParams);
          const filename = `equipment_report_${new Date().toISOString().split('T')[0]}.xlsx`;
          reportsService.downloadFile(blob, filename);
          this.$store.commit('notification/SHOW_SUCCESS', 'Отчет по оборудованию успешно экспортирован');
        } else {
          const blob = await reportsService.exportRequestsReport(this.requestsParams);
          const filename = `requests_report_${new Date().toISOString().split('T')[0]}.xlsx`;
          reportsService.downloadFile(blob, filename);
          this.$store.commit('notification/SHOW_SUCCESS', 'Отчет по заявкам успешно экспортирован');
        }
      } catch (error) {
        console.error('Ошибка при экспорте отчета:', error);
        this.error = error.message || 'Ошибка при экспорте отчета';
        this.$store.commit('notification/SHOW_ERROR', this.error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>