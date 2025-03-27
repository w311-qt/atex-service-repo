import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Create the application instance
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get configuration values
  const port = configService.get<number>('PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const environment = configService.get<string>('NODE_ENV') || 'development';

  // Set global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS for development
  if (environment !== 'production') {
    app.enableCors();
  }

  // Start the server
  await app.listen(port);

  // Log application start
  Logger.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
}

bootstrap();
