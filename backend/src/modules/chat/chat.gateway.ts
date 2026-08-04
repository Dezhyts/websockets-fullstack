import { Logger } from '@nestjs/common';
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

@ApiExtraModels(JoinStreamDto, LeaveStreamDto, SendMessageDto)
@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);

    client.user = {
      id: 'test',
      username: 'alex',
    };
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_stream')
  handleJoinStream(
    @MessageBody()
    payload: JoinStreamDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const room = this.chatService.getRoom(payload.streamId);

    void client.join(room);

    client
      .to(room)
      .emit(
        'user_joined',
        this.chatService.buildUserJoinedPayload(client.user),
      );
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
  handleSendMessage(
    @MessageBody()
    payload: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const room = this.chatService.getRoom(payload.streamId);

    this.server
      .to(room)
      .emit(
        'message',
        this.chatService.buildMessagePayload(client.user, payload.message),
      );
  }
}
