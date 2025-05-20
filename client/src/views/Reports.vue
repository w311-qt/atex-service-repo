<template>
  <div>
    <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center py-2">
        <h1 class="text-h5">Отчеты и аналитика</h1>
      </v-card-title>
    </v-card>

    <v-row>
      <v-col cols="12" md="4">
        <report-exporter />
      </v-col>

      <v-col cols="12" md="8">
        <v-card outlined>
          <v-card-title class="py-2 grey lighten-4">
            <v-icon left color="primary">mdi-chart-bar</v-icon>
            Визуализация данных
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="text-center grey--text">
              <v-icon large color="grey lighten-1">mdi-chart-bar</v-icon>
              <p class="mt-2">Выберите параметры отчета и нажмите "Экспорт в Excel", чтобы загрузить данные в формате Excel</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ReportExporter from '@/components/reports/ReportExporter.vue';

export default {
  name: 'Reports',
  components: {
    ReportExporter
  }
};
</script>