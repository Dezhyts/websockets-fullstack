import { Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ApiExtraModels } from '@nestjs/swagger';
import { Role } from '@prisma/generated/enums';
import { BenchmarkInterceptor } from '@shared/common/interceptors/benchmark.interceptor';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { Roles } from '@shared/decorators/roles-decorator';
import { AuthGuard } from '@shared/guard/auth.guard';
import { OptionalAuthGuard } from '@shared/guard/optional.auth.guard';
import { StreamRoleGuard } from '@shared/guard/stream-role.guard';
import { WsStreamBanGuard } from '@shared/guard/ws.stream.ban.guard';
import { ChatService } from './chat.service';
import {
  BanUserDto,
  JoinStreamDto,
  LeaveStreamDto,
  SendMessageDto,
} from './dto/chat-dto';

@ApiExtraModels(JoinStreamDto, LeaveStreamDto, SendMessageDto, BanUserDto)
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
  @UseGuards(OptionalAuthGuard, WsStreamBanGuard)
  @UseInterceptors(BenchmarkInterceptor)
  async handleJoinStream(
    @MessageBody()
    payload: JoinStreamDto,
    @ConnectedSocket() client: Socket,
    @CurrentUser('sub') userId?: string,
  ) {
    try {
      const room = this.chatService.getRoom(payload.streamId);
      await client.join(room);

      const account = userId
        ? await this.chatService.getAccountById(userId)
        : undefined;

      if (userId) {
        client.to(room).emit(
          'user_joined',
          this.chatService.buildUserJoinedPayload({
            id: userId,
            username: account?.username ?? 'Guest',
          }),
        );
      }
      const history = await this.chatService.getHistoryMessageFromUser(payload);
      client.emit('history', history);
    } catch (error) {
      this.logger.error(`Failed to join stream: ${error}`);
      client.emit('error', { message: 'join stream error' });
    }
  }

  @SubscribeMessage('leave_stream')
  @UseInterceptors(BenchmarkInterceptor)
  async handleLeaveStream(
    @MessageBody()
    payload: LeaveStreamDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const room = this.chatService.getRoom(payload.streamId);
      await client.leave(room);
    } catch (error) {
      this.logger.error(`Failed to leave stream: ${error}`);
      client.emit('error', { message: 'leave stream error' });
    }
  }

  @SubscribeMessage('send_message')
  @UseInterceptors(BenchmarkInterceptor)
  @UseGuards(AuthGuard, WsStreamBanGuard)
  async handleSendMessage(
    @MessageBody()
    payload: SendMessageDto,
    @CurrentUser('sub') userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const room = this.chatService.getRoom(payload.streamId);

      const isUserInRoom = client.rooms.has(room);

      if (!isUserInRoom) {
        client.emit('error', { message: 'You are not in the room' });
        return;
      }

      const messagePayload = await this.chatService.createMessage(
        payload,
        userId,
      );

      this.server.to(room).emit('message', messagePayload);
      this.logger.log('Message saved successfully');
    } catch (error) {
      this.logger.error(`Failed to send message: ${error}`);
      client.emit('error', { message: 'send message error' });
    }
  }

  @SubscribeMessage('ban_user')
  @UseInterceptors(BenchmarkInterceptor)
  @UseGuards(AuthGuard, StreamRoleGuard)
  @Roles(Role.ADMIN, Role.STREAMER)
  async handleBanUser(
    @MessageBody() payload: BanUserDto,
    @ConnectedSocket() client: Socket,
    @CurrentUser('sub') userId: string,
  ) {
    try {
      const room = this.chatService.getRoom(payload.streamId);

      await this.chatService.banUser(payload, userId);
      this.server
        .to(room)
        .emit('user_banned', { userId: payload.targetUserIdBan });
    } catch (error) {
      this.logger.error(`Failed to ban user: ${error}`);
      client.emit('error', { message: 'ban user error' });
    }
  }
}
