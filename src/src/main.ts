import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';

  // Настраиваем глобальный префикс для всех маршрутов API
  app.setGlobalPrefix(apiPrefix);

  await app.listen(port);

  Logger.log(`🚀 Приложение запущено на: http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
}

bootstrap();
