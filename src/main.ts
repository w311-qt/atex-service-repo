import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const environment = configService.get<string>('NODE_ENV') || 'development';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.setGlobalPrefix(apiPrefix);

  if (environment !== 'production') {
    app.enableCors({
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:8080',
        'http://192.168.0.100:8081',
        'http://localhost:3000',
        'http://192.168.0.100:8080'
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  await app.listen(port);

  Logger.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
}

bootstrap();
