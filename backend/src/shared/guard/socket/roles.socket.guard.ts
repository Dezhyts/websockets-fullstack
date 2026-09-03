import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Role } from '@prisma/generated/enums';
import { ROLES_KEY } from '@shared/decorators/roles-decorator';
import { Socket } from 'socket.io';
@Injectable()
export class RolesSocketGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const req = context.switchToWs().getClient<Socket>();
    const user = req.user;

    if (!user || !requiredRoles.includes(user.role) || !user.role) {
      throw new WsException('Недостаточно прав доступа');
    }

    return true;
  }
}
