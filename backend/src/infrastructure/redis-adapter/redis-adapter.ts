import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import type { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private readonly pubClient: Redis;
  private readonly subClient: Redis;
  private readonly adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(app: INestApplication, configService: ConfigService) {
    super(app);

    this.pubClient = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
      maxRetriesPerRequest: null,
    });
    this.subClient = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
      maxRetriesPerRequest: null,
    });

    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);

    process.on('SIGTERM', () => void this.disconnect());
    process.on('SIGINT', () => void this.disconnect());
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.adapterConstructor);
    return server;
  }

  public async disconnect(): Promise<void> {
    await this.pubClient.quit();
    await this.subClient.quit();
  }
}
