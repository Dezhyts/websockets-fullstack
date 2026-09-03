import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Emitter } from '@socket.io/redis-emitter';
import Redis from 'ioredis';

export const REDIS_EMITTER = 'REDIS_EMITTER';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_EMITTER,
      useFactory: (configService: ConfigService) => {
        const redisClient = new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        });
        return new Emitter(redisClient);
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_EMITTER],
})
export class RedisEmitterModule {}
