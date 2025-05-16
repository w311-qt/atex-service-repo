total: 0,
byStatus: [],
byType: [],
byTechnician: [],
resolutionTime: [],
averageResolutionTime: 0,
trend: []
};
}
},
created() {
this.loadReferenceData();
},
mounted() {
window.addEventListener('resize', this.handleResize);
},
beforeDestroy() {
window.removeEventListener('resize', this.handleResize);
this.destroyCharts();
},
methods: {
async loadReferenceData() {
try {
// Загружаем справочные данные, если их еще нет
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
this.$store.commit('notification/SHOW_ERROR', 'Ошибка при загрузке справочных данных');
}
},

resetParams() {
if (this.selectedReportType === 'equipment') {
this.equipmentParams = {
categoryIds: [],
statusIds: [],
dateFrom: null,
dateTo: null
};
} else {
this.requestParams = {
statusIds: [],
typeIds: [],
assignedToIds: [],
dateFrom: null,
dateTo: null
};
}
this.$store.dispatch('reports/clearReportsData');
this.destroyCharts();
},

async generateReport() {
this.loading = true;
this.destroyCharts();

try {
if (this.selectedReportType === 'equipment') {
// Вызов API для отчета по оборудованию
await this.$store.dispatch('reports/getEquipmentReport', this.equipmentParams);
} else {
// Вызов API для отчета по заявкам
await this.$store.dispatch('reports/getRequestReport', this.requestParams);
}

this.$nextTick(() => {
this.renderCharts();
});
} catch (error) {
this.$store.commit('notification/SHOW_ERROR', 'Ошибка при формировании отчета');
} finally {
this.loading = false;
}
},

handleResize() {
if (this.reportData) {
this.renderCharts();
}
},

renderCharts() {
this.destroyCharts();

this.$nextTick(() => {
if (this.selectedReportType === 'equipment') {
this.renderEquipmentCharts();
} else {
this.renderRequestCharts();
}
});
},

renderEquipmentCharts() {
// Диаграмма по категориям
const categoryCtx = this.$refs.categoryChart?.getContext('2d');
if (categoryCtx && this.equipmentReportData.byCategory && this.equipmentReportData.byCategory.length > 0) {
const labels = this.equipmentReportData.byCategory.map(item => item.category);
const data = this.equipmentReportData.byCategory.map(item => item.count);
const colors = this.generateColors(data.length);

this.charts.categoryChart = new Chart(categoryCtx, {
type: 'pie',
data: {
labels: labels,
datasets: [{
data: data,
backgroundColor: colors
}]
},
options: {
responsive: true,
plugins: {
legend: {
position: 'right'
},
title: {
display: false
}
}
}
});
}

// Диаграмма по статусам
const statusCtx = this.$refs.statusChart?.getContext('2d');
if (statusCtx && this.equipmentReportData.byStatus && this.equipmentReportData.byStatus.length > 0) {
const labels = this.equipmentReportData.byStatus.map(item => item.status);
const data = this.equipmentReportData.byStatus.map(item => item.count);
const colors = this.getStatusColors(labels);

this.charts.statusChart = new Chart(statusCtx, {
type: 'doughnut',
data: {
labels: labels,
datasets: [{
data: data,
backgroundColor: colors
}]
},
options: {
responsive: true,
plugins: {
legend: {
position: 'right'
},
title: {
display: false
}
}
}
});
}
},

renderRequestCharts() {
// Диаграмма по типам заявок
const typeCtx = this.$refs.requestTypeChart?.getContext('2d');
if (typeCtx && this.requestReportData.byType && this.requestReportData.byType.length > 0) {
const labels = this.requestReportData.byType.map(item => item.type);
const data = this.requestReportData.byType.map(item => item.count);
const colors = this.generateColors(data.length);

this.charts.requestTypeChart = new Chart(typeCtx, {
type: 'pie',
data: {
labels: labels,
datasets: [{
data: data,
backgroundColor: colors
}]
},
options: {
responsive: true,
plugins: {
legend: {
position: 'right'
},
title: {
display: false
}
}
}
});
}

// Временная диаграмма по заявкам
const trendCtx = this.$refs.requestTrendChart?.getContext('2d');
if (trendCtx && this.requestReportData.trend && this.requestReportData.trend.length > 0) {
const labels = this.requestReportData.trend.map(item => item.month);
const data = this.requestReportData.trend.map(item => item.count);

this.charts.requestTrendChart = new Chart(trendCtx, {
type: 'line',
data: {
labels: labels,
datasets: [{
label: 'Количество заявок',
data: data,
backgroundColor: 'rgba(54, 162, 235, 0.2)',
borderColor: 'rgba(54, 162, 235, 1)',
borderWidth: 2,
tension: 0.3,
fill: true
}]
},
options: {
responsive: true,
scales: {
y: {
beginAtZero: true,
ticks: {
precision: 0
}
}
},
plugins: {
legend: {
display: false
},
title: {
display: false
}
}
}
});
}
},

destroyCharts() {
Object.keys(this.charts).forEach(key => {
if (this.charts[key]) {
this.charts[key].destroy();
this.charts[key] = null;
}
});
},

async exportReport() {
if (!this.reportData) return;

try {
let response;
if (this.selectedReportType === 'equipment') {
response = await this.$store.dispatch('reports/exportEquipmentReport', this.equipmentParams);
} else {
response = await this.$store.dispatch('reports/exportRequestReport', this.requestParams);
}

const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', `${this.selectedReportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

this.$store.commit('notification/SHOW_SUCCESS', 'Отчет успешно экспортирован');
} catch (error) {
this.$store.commit('notification/SHOW_ERROR', 'Ошибка при экспорте отчета');
}
},

printReport() {
window.print();
},

formatReportDate() {
return new Date().toLocaleDateString('ru-RU', {
day: '2-digit',
month: '2-digit',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
},

calculatePercentage(value, total) {
if (!total) return 0;
return Math.round((value / total) * 100);
},

formatHours(hours) {
if (typeof hours !== 'number') return '0 ч';
if (hours < 1) {
return `${Math.round(hours * 60)} мин`;
}
return `${Math.round(hours * 10) / 10} ч`;
},

generateColors(count) {
const colors = [
'#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0',
'#3F51B5', '#009688', '#795548', '#607D8B', '#E91E63'
];

if (count <= colors.length) {
return colors.slice(0, count);
}

// Если нужно больше цветов, генерируем их случайным образом
const result = [...colors];
for (let i = colors.length; i < count; i++) {
const r = Math.floor(Math.random() * 200) + 20;
const g = Math.floor(Math.random() * 200) + 20;
const b = Math.floor(Math.random() * 200) + 20;
result.push(`rgb(${r}, ${g}, ${b})`);
}

return result;
},

getStatusColors(statusNames) {
const statusColorMap = {
'Новый': '#2196F3',
'Рабочий': '#4CAF50',
'Дефектный': '#FFC107',
'Нерабочий': '#F44336',
'Новая': '#2196F3',
'В работе': '#FF9800',
'Ожидает': '#FFC107',
'Выполнена': '#4CAF50',
'Отменена': '#F44336'
};

return statusNames.map(name => statusColorMap[name] || '#607D8B');
}
}
};
</script>

<style>
@media print {
  .v-app-bar,
  .v-navigation-drawer,
  .v-footer,
  .no-print {
    display: none !important;
  }

  #report-content {
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  body {
    font-size: 12pt;
  }

  h1 {
    font-size: 18pt;
  }

  h2 {
    font-size: 16pt;
  }

  h3 {
    font-size: 14pt;
  }
}
</style>