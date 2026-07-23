import { JwtPayload } from '../types/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      canPublish?: boolean;
    }
  }
}
