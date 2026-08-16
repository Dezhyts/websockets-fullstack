import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@shared/consts/jwt';
import { Request } from 'express';
import { Socket } from 'socket.io';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token: string | undefined;
    let targetObject: Request | Socket;

    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient<Socket>();
      targetObject = client;

      token =
        (client.handshake?.headers?.token as string | undefined) ||
        (client.handshake?.query?.token as string | undefined) ||
        (client.handshake?.auth?.token as string | undefined);

      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }
    } else {
      const request = context.switchToHttp().getRequest<Request>();
      targetObject = request;
      token = request.cookies?.['accessToken'] as string | undefined;
    }

    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }

    try {
      const result = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      targetObject.user = result;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
