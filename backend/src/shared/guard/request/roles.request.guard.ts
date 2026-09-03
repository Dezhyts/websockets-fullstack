import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/generated/enums';
import { ROLES_KEY } from '@shared/decorators/roles-decorator';
import { Request } from 'express';

@Injectable()
export class RolesRequestGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user;

    if (!user || !requiredRoles.includes(user.role) || !user.role) {
      throw new ForbiddenException('Недостаточно прав доступа');
    }

    return true;
  }
}
