// client/src/utils/chartUtils.js

/**
 * Генерирует случайные цвета для графиков
 * @param {number} count - Количество цветов
 * @returns {Array} Массив цветов в формате RGB
 */
export const generateChartColors = (count) => {
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
};

/**
 * Возвращает цвета для статусов оборудования и заявок
 * @param {Array} statusNames - Массив имен статусов
 * @returns {Array} Массив цветов, соответствующих статусам
 */
export const getStatusColors = (statusNames) => {
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
};

/**
 * Возвращает цвет для статуса оборудования
 * @param {Object} status - Объект статуса
 * @returns {string} Цвет статуса
 */
export const getEquipmentStatusColor = (status) => {
  if (!status) return 'grey';

  const colorMap = {
    'Новый': 'info',
    'Рабочий': 'success',
    'Дефектный': 'warning',
    'Нерабочий': 'error'
  };

  return colorMap[status.name] || status.color || 'grey';
};

/**
 * Возвращает цвет для статуса заявки
 * @param {Object} status - Объект статуса
 * @returns {string} Цвет статуса
 */
export const getRequestStatusColor = (status) => {
  if (!status) return 'grey';

  const colorMap = {
    'Новая': 'info',
    'В работе': 'primary',
    'Ожидает': 'warning',
    'Выполнена': 'success',
    'Отменена': 'error'
  };

  return colorMap[status.name] || status.color || 'grey';
};

/**
 * Возвращает цвет для типа активности
 * @param {string} type - Тип активности
 * @returns {string} Цвет типа активности
 */
export const getActivityColor = (type) => {
  const typeColors = {
    'create': 'green',
    'update': 'blue',
    'statusChange': 'orange',
    'comment': 'purple',
    'assign': 'indigo',
    'complete': 'green',
    'cancel': 'red'
  };

  return typeColors[type] || 'grey';
};

/**
 * Возвращает заголовок для типа активности
 * @param {string} type - Тип активности
 * @returns {string} Заголовок типа активности
 */
export const getActivityTitle = (activity) => {
  const typeTitles = {
    'create': 'Создание заявки',
    'update': 'Обновление заявки',
    'statusChange': 'Изменение статуса',
    'comment': 'Комментарий',
    'assign': 'Назначение исполнителя',
    'complete': 'Завершение заявки',
    'cancel': 'Отмена заявки'
  };

  return typeTitles[activity.type] || 'Действие';
};