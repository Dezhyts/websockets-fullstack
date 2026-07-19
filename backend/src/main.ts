import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RedisIoAdapter } from './infrastructure/redis-adapter/redis-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  const config = app.get(ConfigService);
  const host = config.getOrThrow<string>('HOST') ?? 'localhost';
  const port = config.getOrThrow<number>('PORT') ?? 3000;

  const redisAdapter = new RedisIoAdapter(app, config);
  app.useWebSocketAdapter(redisAdapter);

  await app.listen(port);
  logger.log(`App started on ${host}:${port}`);
}
bootstrap();
