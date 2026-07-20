import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './infrastructure/redis-adapter/redis-adapter';
import { getValidationPipe } from './shared/config/validaton-pipe.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  const config = app.get(ConfigService);
  const host = config.getOrThrow<string>('HOST') ?? 'localhost';
  const port = config.getOrThrow<number>('PORT') ?? 3000;

  const redisAdapter = new RedisIoAdapter(app, config);
  app.useWebSocketAdapter(redisAdapter);

  app.useGlobalPipes(new ValidationPipe(getValidationPipe()));

  await app.listen(port);
  logger.log(`App started on ${host}:${port}`);
}
bootstrap();
