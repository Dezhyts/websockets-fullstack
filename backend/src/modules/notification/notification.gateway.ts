import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtPayload } from '@shared/consts/jwt';
import { Server, Socket } from 'socket.io';
import { getValidationPipe } from '@shared/config/validation-pipe.config';

@UsePipes(new ValidationPipe(getValidationPipe()))
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationGateway {
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const userId = await this.extractUserIdFromAuth(client);

    if (userId) {
      void client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected to notifications`);
    } else {
      this.logger.log(`Guest connected: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private async extractUserIdFromAuth(client: Socket) {
    let token =
      (client.handshake?.headers?.token as string | undefined) ||
      (client.handshake?.query?.token as string | undefined) ||
      (client.handshake?.auth?.token as string | undefined);

    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token) {
      return null;
    }

    try {
      const result = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      return result.sub;
    } catch {
      return null;
    }
  }
}
