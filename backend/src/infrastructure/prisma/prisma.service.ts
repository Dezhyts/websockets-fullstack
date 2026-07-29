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
      user: configService.getOrThrow<string>('POSTGRES_USER'),
      password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
      host: configService.getOrThrow<string>('POSTGRES_HOST'),
      port: configService.getOrThrow<number>('POSTGRES_PORT'),
      database: configService.getOrThrow<string>('POSTGRES_DB'),
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
