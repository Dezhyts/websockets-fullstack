import { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import { Role } from './roles.enum';

export interface JwtPayload extends BaseJwtPayload {
  id: string;
  email: string;
  role: Role[];
}
