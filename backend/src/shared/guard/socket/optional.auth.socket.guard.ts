import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@shared/consts/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class OptionalAuthSocketGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthSocketGuard.name);

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
      return true;
    }

    try {
      const result = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      client.user = result;
    } catch (error) {
      this.logger.debug('JWT verification error:', error);
    }

    return true;
  }
}
