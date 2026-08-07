import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { JoinStreamDto, LeaveStreamDto, SendMessageDto } from './dto/chat-dto';
import type { AuthenticatedSocket } from './types/chat.types';
import { ApiExtraModels } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthGuard } from '@shared/guard/auth.guard';

@ApiExtraModels(JoinStreamDto, LeaveStreamDto, SendMessageDto)
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_stream')
  async handleJoinStream(
    @MessageBody()
    payload: JoinStreamDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const room = this.chatService.getRoom(payload.streamId);

    void client.join(room);

    if (client.user) {
      client
        .to(room)
        .emit(
          'user_joined',
          this.chatService.buildUserJoinedPayload(client.user),
        );
    }

    return await this.chatService.getHistoryMessageFromUser(payload);
  }

  @SubscribeMessage('leave_stream')
  handleLeaveStream(
    @MessageBody()
    payload: LeaveStreamDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.chatService.getRoom(payload.streamId);

    void client.leave(room);
  }

  @SubscribeMessage('send_message')
  @UseGuards(AuthGuard)
  async handleSendMessage(
    @MessageBody()
    payload: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
    @CurrentUser('sub') userId: string,
  ) {
    this.logger.log(
      `Sending message... userId=${userId}, payload=${JSON.stringify(payload)}`,
    );

    const room = this.chatService.getRoom(payload.streamId);

    const messagePayload = await this.chatService.createAndSaveMessage(
      payload,
      userId,
    );
    this.server.to(room).emit('message', messagePayload);

    this.logger.log('Message saved successfully');
  }
}
