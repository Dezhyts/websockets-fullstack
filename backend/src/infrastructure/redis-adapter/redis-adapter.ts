import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import type { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  public readonly pubClient: Redis;
  public readonly subClient: Redis;
  public readonly adapterConstructor: ReturnType<typeof createAdapter>;
  logger = new Logger(RedisIoAdapter.name);

  constructor(app: INestApplication, configService: ConfigService) {
    super(app);
    const host = configService.getOrThrow<string>('REDIS_HOST');
    const port = Number(configService.getOrThrow<string>('REDIS_PORT'));
    const password = configService.get<string>('REDIS_PASSWORD') || undefined;

    const redisOptions = {
      host,
      port,
      password,

      maxRetriesPerRequest: null,

      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 100, 2000);
      },
    };

    this.pubClient = new Redis(redisOptions);
    this.subClient = new Redis(redisOptions);

    this.setupListeners(this.pubClient, 'PUB');
    this.setupListeners(this.subClient, 'SUB');

    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
  }

  private setupListeners(client: Redis, name: string) {
    client.on('connect', () => {
      this.logger.log(`Redis ${name}: connecting`);
    });

    client.on('ready', () => {
      this.logger.log(`Redis ${name}: ready`);
    });

    client.on('reconnecting', () => {
      this.logger.log(`Redis ${name}: reconnecting`);
    });

    client.on('close', () => {
      this.logger.log(`Redis ${name}: closed`);
    });

    client.on('error', (error) => {
      this.logger.error(`Redis ${name}: error`, {
        message: error.message,
        host: client.options.host,
        port: client.options.port,
      });
    });
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;

    server.adapter(this.adapterConstructor);

    return server;
  }

  async disconnect(): Promise<void> {
    await Promise.all([this.pubClient.quit(), this.subClient.quit()]);
  }
}
