import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinStreamDto, LeaveStreamDto, SendMessageDto } from './dto/chat-dto';

interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    username: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;
  handleConnection(client: AuthenticatedSocket) {
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
    const room = this.getRoom(payload.streamId);

    void client.join(room);

    client.to(room).emit('user_joined', {
      userId: client.user.id,
      username: client.user.username,
    });
  }

  @SubscribeMessage('leave_stream')
  handleLeaveStream(
    @MessageBody()
    payload: LeaveStreamDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.getRoom(payload.streamId);

    void client.leave(room);
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @MessageBody()
    payload: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const room = this.getRoom(payload.streamId);

    this.server.to(room).emit('message', {
      userId: client.user.id,
      username: client.user.username,
      message: payload.message,
      createdAt: new Date().toISOString(),
    });
  }

  private getRoom(streamId: string): string {
    return `stream:${streamId}`;
  }
}
