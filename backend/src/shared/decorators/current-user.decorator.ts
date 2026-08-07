import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthorizedContext {
  user?: Record<string, unknown>;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    let user: Record<string, unknown> | undefined;

    if (ctx.getType() === 'ws') {
      user = ctx.switchToWs().getClient<AuthorizedContext>().user;
    } else {
      user = ctx.switchToHttp().getRequest<AuthorizedContext>().user;
    }

    if (!user) return undefined;

    return data ? user[data] : user;
  },
);
