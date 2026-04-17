import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggerService } from '@common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);

  // Global configuration
  const port = configService.get<number>('APP_PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('APP_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter(loggerService));

  // Static files
  // This will be configured separately if needed

  await app.listen(port, '0.0.0.0', () => {
    loggerService.log(
      `🚀 Server started on http://localhost:${port} [${nodeEnv}]`,
      'Bootstrap',
    );
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
