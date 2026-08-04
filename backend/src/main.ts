import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './infrastructure/redis-adapter/redis-adapter';
import { getSwaggerConfig } from '@shared/config/swagger.config';
import { getValidationPipe } from '@shared/config/validation-pipe.config';
import cookieParser from 'cookie-parser';
import { BenchmarkInterceptor } from '@shared/common/interceptors/benchmark.interceptor';
import { PrismaExceptionFilter } from '@shared/common/exception/prisma-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: 'http://localhost:4000',
    credentials: true,
  });

  const logger = new Logger();
  const config = app.get(ConfigService);
  const host = config.getOrThrow<string>('HOST');
  const port = config.getOrThrow<number>('PORT') ?? 3000;

  const redisAdapter = new RedisIoAdapter(app, config);
  app.useWebSocketAdapter(redisAdapter);
  app.use(cookieParser());
  getSwaggerConfig(app);

  app.useGlobalPipes(new ValidationPipe(getValidationPipe()));
  app.useGlobalInterceptors(new BenchmarkInterceptor());
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.listen(port);
  logger.log(`App started on ${host}:${port}`);
  logger.log(`Swagger: http://${host}:${port}/docs`);
}
bootstrap();
