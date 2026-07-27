import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/generated/enums';

export const ROLES_KEY = 'stream-roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
