import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatModule } from './modules/chat/chat.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
    ChatModule,
    PrismaModule,

    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
