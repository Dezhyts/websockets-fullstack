import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@shared/consts/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalAuthRequestGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthRequestGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['accessToken'] as string | undefined;

    if (!token) {
      return true;
    }

    try {
      const result = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      request.user = result;
    } catch (error) {
      this.logger.debug('JWT verification error:', error);
    }

    return true;
  }
}
