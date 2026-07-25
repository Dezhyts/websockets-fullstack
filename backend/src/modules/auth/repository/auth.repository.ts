import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/generated/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByIdentity(identity: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            username: identity,
          },
          {
            email: identity,
          },
        ],
      },
    });
  }

  async createUser(): Promise<User> {
    return this.prismaService.user.create({});
  }
}
