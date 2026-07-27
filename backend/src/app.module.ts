import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ChatModule } from './modules/chat/chat.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { MediaModule } from './modules/media/media.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@infrastructure/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_ACCESS_SECRET'),
      }),
    }),
    ChatModule,
    PrismaModule,
    RedisModule,
    MediaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
