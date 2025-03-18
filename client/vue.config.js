module.exports = {
  // Базовый путь для развертывания (можно изменить при необходимости)
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',

  // Директория для собранного приложения
  outputDir: '../dist/client',

  // Настройки DevServer для разработки
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },

  // Генерация sourcemaps для продакшн
  productionSourceMap: false,

  // Настройки CSS
  css: {
    loaderOptions: {
      sass: {
        // Здесь можно добавить глобальные стили SASS
      }
    }
  },

  // Конфигурация Webpack
  configureWebpack: {
    // Оптимизации для продакшн сборки
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  }
};