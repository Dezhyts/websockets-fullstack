import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { PrismaExceptionFilter } from '@shared/common/exception/prisma-filter';
import { getSwaggerConfig } from '@shared/config/swagger.config';
import { getValidationPipe } from '@shared/config/validation-pipe.config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './infrastructure/redis-adapter/redis-adapter';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger();
  const appMode = process.env.APP_MODE;

  if (appMode === 'worker') {
    const appContext = await NestFactory.createApplicationContext(AppModule);
    appContext.enableShutdownHooks();
    logger.log('WORKER MODE Started and listen...');
    return;
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useBodyParser('json', {
    type: ['application/json', 'application/webhook+json'],
  });

  app.enableShutdownHooks();
  const config = app.get(ConfigService);
  const host = config.get<string>('HOST', '0.0.0.0');
  const port = config.get<number>('PORT', 3000);

  app.enableCors({
    origin: 'http://localhost:4000',
    credentials: true,
  });

  const redisAdapter = new RedisIoAdapter(app, config);
  app.useWebSocketAdapter(redisAdapter);
  app.use(cookieParser());
  getSwaggerConfig(app);

  app.useGlobalPipes(new ValidationPipe(getValidationPipe()));
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.listen(port, host);
  logger.log(`App started on ${host}:${port}`);
  logger.log(`Swagger: http://${host}:${port}/docs`);
}
bootstrap();
