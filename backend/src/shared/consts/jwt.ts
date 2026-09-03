import { Role } from '@prisma/generated/enums';
import { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends BaseJwtPayload {
  sub: string;
  email: string;
  username: string;
  role: Role;
}
