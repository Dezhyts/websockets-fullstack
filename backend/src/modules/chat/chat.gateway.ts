import { Logger, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { ApiExtraModels } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthGuard } from '@shared/guard/auth.guard';
import { OptionalWsAuthGuard } from '@shared/guard/optional.auth.guard';
import { BenchmarkInterceptor } from '@shared/common/interceptors/benchmark.interceptor';

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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_stream')
  @UseGuards(OptionalWsAuthGuard)
  @UseInterceptors(BenchmarkInterceptor)
  async handleJoinStream(
    @MessageBody()
    payload: JoinStreamDto,
    @ConnectedSocket() client: Socket,
    @CurrentUser('sub') userId: string,
  ) {
    const room = this.chatService.getRoom(payload.streamId);
    void client.join(room);

    const account = userId
      ? await this.chatService.getAccountById(userId)
      : undefined;

    if (client.user) {
      client.to(room).emit(
        'user_joined',
        this.chatService.buildUserJoinedPayload({
          id: userId,
          username: account?.username ?? 'Guest',
        }),
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
    @ConnectedSocket() client: Socket,
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
