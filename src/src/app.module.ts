import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // Загружаем переменные окружения
    ConfigModule.forRoot({
      isGlobal: true, // Делаем модуль конфигурации глобальным
    }),

    // Настраиваем подключение к базе данных
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Здесь будут другие модули приложения
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
