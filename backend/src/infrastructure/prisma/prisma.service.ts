import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/generated/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  public constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaPg({
      user: configService.getOrThrow<string>('DATABASE_USER_AUTH'),
      password: configService.getOrThrow<string>('DATABASE_PASSWORD_AUTH'),
      host: configService.getOrThrow<string>('DATABASE_HOST_AUTH'),
      port: configService.getOrThrow<number>('DATABASE_PORT_AUTH'),
      database: configService.getOrThrow<string>('DATABASE_NAME_AUTH'),
    });
    super({ adapter });
  }

  public async onModuleInit() {
    const timer = Date.now();
    try {
      await this.$connect();
      const ms = Date.now() - timer;
      this.logger.log(`Connected to database in ${ms}ms`);
    } catch (error) {
      this.logger.error('Failed to connect to the database');
      throw error;
    }
  }
  public async onModuleDestroy() {
    try {
      this.logger.log('Disconnected from database');
      await this.$disconnect();
    } catch (error) {
      this.logger.error('Failed to disconnect from the database');
      throw error;
    }
  }
}
