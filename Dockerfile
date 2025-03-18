# Этап сборки
FROM node:16-alpine AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json для установки зависимостей
COPY package*.json ./
COPY src/package*.json ./src/
COPY client/package*.json ./client/

# Устанавливаем зависимости
RUN npm install
RUN cd src && npm install
RUN cd ../client && npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Создаем финальный образ
FROM node:16-alpine

WORKDIR /app

# Копируем только необходимые файлы для запуска приложения
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/node_modules ./node_modules
COPY --from=build /app/src/package.json ./

# Открываем порт для приложения
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run", "start:prod"]