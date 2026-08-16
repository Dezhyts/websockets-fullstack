import { JwtPayload } from '@shared/consts/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      canPublish?: boolean;
    }
  }
}

declare module 'socket.io' {
  interface Socket {
    user?: JwtPayload;
    canPublish?: boolean;
  }
}
