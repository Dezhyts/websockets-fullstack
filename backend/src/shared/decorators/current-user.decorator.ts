import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@shared/consts/jwt';

interface RequestWithAccount extends Request {
  user: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAccount>();

    return request.user?.sub;
  },
);
