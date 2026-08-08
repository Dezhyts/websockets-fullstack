import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    let user: Record<string, unknown> | undefined;

    if (ctx.getType() === 'ws') {
      user = ctx.switchToWs().getClient<Socket>().user;
    } else {
      user = ctx.switchToHttp().getRequest<Request>().user;
    }

    if (!user) return undefined;

    return data ? user[data] : user;
  },
);
