import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './consts/redis-consts';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisRetry');

        return new Redis({
          host: configService.getOrThrow<string>('REDIS_HOST', 'redis'),
          port: configService.getOrThrow<number>('REDIS_PORT'),
          password: configService.getOrThrow<string>('REDIS_PASSWORD'),

          maxRetriesPerRequest: 5,
          enableOfflineQueue: true,
          lazyConnect: true,

          retryStrategy(times) {
            if (times > 5) return null;
            logger.error(
              `Redis connection failed after ${times - 1} attempts. Application will not be able to use Redis.`,
            );
            return 5000;
          },
        });
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
