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
export class AuthRequestGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['accessToken'] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }

    try {
      const result = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      request.user = result;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
