import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/generated/enums';
import { ROLES_KEY } from '@shared/decorators/roles-decorator';
import { Socket } from 'socket.io';
import { Request } from 'express';

@Injectable()
export class StreamRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const isWs = context.getType() === 'ws';

    const targetObject = isWs
      ? context.switchToWs().getClient<Socket>()
      : context.switchToHttp().getRequest<Request>();

    const user = targetObject.user;

    if (!user || !user.role) {
      targetObject.canPublish = false;
      return true;
    }

    const hasPermission = requiredRoles.includes(user.role);

    if (!hasPermission) {
      throw new ForbiddenException('Has no permission');
    }

    if (user.role === Role.STREAMER) {
      targetObject.canPublish = true;
    } else {
      targetObject.canPublish = false;
    }

    return true;
  }
}
