import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@shared/consts/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class OptionalWsAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalWsAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    let token =
      (client.handshake?.headers?.token as string | undefined) ||
      (client.handshake?.query?.token as string | undefined) ||
      client.handshake?.headers?.['authorization'];

    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }

    try {
      const result = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      client.user = result;
    } catch (error) {
      this.logger.error(error);
    }
    return true;
  }
}
