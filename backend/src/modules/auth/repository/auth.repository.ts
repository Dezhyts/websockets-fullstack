import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/generated/client';
import { AccountCreateInput } from '@prisma/generated/models';

export type AccountPick = Pick<Account, 'id'>;
@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByIdentity(identity: string): Promise<Account | null> {
    return this.prismaService.account.findFirst({
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
  async findById(id: string): Promise<Account | null> {
    return this.prismaService.account.findFirst({
      where: {
        id,
      },
    });
  }

  async createAccount(data: AccountCreateInput): Promise<Account> {
    return this.prismaService.account.create({
      data,
    });
  }

  async findByUsername(username: string): Promise<AccountPick | null> {
    return this.prismaService.account.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
  }
}
