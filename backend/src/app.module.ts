import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from './modules/gateway/gateway.module';
import { ChatGatewayModule } from './modules/chat.gateway/chat.gateway.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development', '.env'],
    }),
    GatewayModule,
    ChatGatewayModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
