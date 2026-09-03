import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { JwtPayload } from '@shared/consts/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class AuthSocketGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    let token =
      (client.handshake?.headers?.token as string | undefined) ||
      (client.handshake?.query?.token as string | undefined) ||
      (client.handshake?.auth?.token as string | undefined);

    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token) {
      throw new WsException('Authorization token not found');
    }

    try {
      const result = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      client.user = result;

      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}
