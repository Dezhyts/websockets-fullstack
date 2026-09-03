import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RedisModule } from '@infrastructure/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MediaModule } from './modules/media/media.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BenchmarkInterceptor } from '@shared/common/interceptors/benchmark.interceptor';
import { NotificationModule } from './modules/notification/notification.module';
import { BullMqModule } from '@infrastructure/bullmq/bullmq.module';
import { FollowModule } from './modules/follow/follow.module';
import { RedisEmitterModule } from '@infrastructure/redis-emitter/redis-emitter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_ACCESS_SECRET'),
      }),
    }),
    RedisEmitterModule,
    ChatModule,
    PrismaModule,
    BullMqModule,
    RedisModule,
    MediaModule,
    AuthModule,
    NotificationModule,
    FollowModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: BenchmarkInterceptor,
    },
  ],
})
export class AppModule {}
