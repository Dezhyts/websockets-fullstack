import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatRepository } from './repository/chat.repository';
import { ChatRedisRepository } from './repository/chat-redis.repository';

@Module({
  providers: [ChatService, ChatGateway, ChatRepository, ChatRedisRepository],
})
export class ChatModule {}
