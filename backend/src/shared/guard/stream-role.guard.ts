import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@shared/consts/roles.enum';
import { ROLES_KEY } from '@shared/decorators/roles-decorator';
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
    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Has no permission');
    }

    if (!requiredRoles) return true;

    const permission = user.role.some((userRole) =>
      requiredRoles.includes(userRole),
    );

    if (!permission) {
      throw new ForbiddenException('Has no permission');
    }
    request.canPublish = user.role.includes(Role.STREAMER);

    return true;
  }
}
