import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatRepository } from './repository/chat.repository';

@Module({
  providers: [ChatService, ChatGateway, ChatRepository],
})
export class ChatModule {}
