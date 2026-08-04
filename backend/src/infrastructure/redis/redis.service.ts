import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { REDIS_CLIENT } from './consts/redis-consts';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  public get client(): Redis {
    return this.redisClient;
  }

  public async onModuleInit() {
    try {
      const start = Date.now();

      this.redisClient.on('connect', () =>
        this.logger.log('Redis connecting...'),
      );

      this.redisClient.on('ready', () => {
        const ms = Date.now() - start;
        this.logger.log(`Connected to Redis in ${ms}ms`);
      });

      this.redisClient.on('error', (error) =>
        this.logger.error('Redis connection error', error),
      );

      this.redisClient.on('close', () =>
        this.logger.log('Redis connection closed'),
      );
      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Failed to connect to the Redis database', error);
    }
  }

  public async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    try {
      await this.redisClient.quit();
    } catch (error) {
      this.logger.error('Failed to disconnect from the Redis database', error);
    }
  }
}
