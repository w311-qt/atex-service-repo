import moment from 'moment';

/**
 * Форматирует дату в формате ДД.ММ.ГГГГ
 * @param {Date|string} date - Дата для форматирования
 * @param {string} defaultValue - Значение по умолчанию, если дата null или undefined
 * @returns {string} Отформатированная дата
 */
export const formatDate = (date, defaultValue = '-') => {
  if (!date) return defaultValue;
  return moment(date).format('DD.MM.YYYY');
};

/**
 * Форматирует дату и время в формате ДД.ММ.ГГГГ ЧЧ:ММ
 * @param {Date|string} dateTime - Дата и время для форматирования
 * @param {string} defaultValue - Значение по умолчанию, если дата null или undefined
 * @returns {string} Отформатированная дата и время
 */
export const formatDateTime = (dateTime, defaultValue = '-') => {
  if (!dateTime) return defaultValue;
  return moment(dateTime).format('DD.MM.YYYY HH:mm');
};

/**
 * Получает разницу между двумя датами в часах
 * @param {Date|string} startDate - Начальная дата
 * @param {Date|string} endDate - Конечная дата
 * @returns {number} Количество часов
 */
export const getHoursDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, 'hours', true);
};

/**
 * Форматирует заданное количество часов в читаемый формат
 * @param {number} hours - Количество часов
 * @returns {string} Форматированная строка
 */
export const formatHours = (hours) => {
  if (typeof hours !== 'number') return '0 ч';
  if (hours < 1) {
    return `${Math.round(hours * 60)} мин`;
  }
  return `${Math.round(hours * 10) / 10} ч`;
};

/**
 * Получает текущую дату в формате YYYY-MM-DD
 * @returns {string} Дата в формате YYYY-MM-DD
 */
export const getCurrentDate = () => {
  return moment().format('YYYY-MM-DD');
};

/**
 * Проверяет, является ли дата действительной
 * @param {string} dateString - Строка с датой
 * @returns {boolean} Результат проверки
 */
export const isValidDate = (dateString) => {
  return moment(dateString, 'YYYY-MM-DD', true).isValid();
};

export default {
  formatDate,
  formatDateTime,
  getHoursDifference,
  formatHours,
  getCurrentDate,
  isValidDate
};