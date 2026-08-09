import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/generated/client';
import { MessageUncheckedCreateInput } from '@prisma/generated/models';

export type MessageWithAccount = Prisma.MessageGetPayload<{
  include: {
    account: { select: { id: true; username: true } };
  };
}>;

@Injectable()
export class ChatRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createMessage(
    data: MessageUncheckedCreateInput,
  ): Promise<MessageWithAccount> {
    return this.prismaService.message.create({
      data,
      include: {
        account: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
      },
    });
  }
  async getMessagesByStream(
    streamId: string,
    limit: number,
    cursor?: string,
  ): Promise<MessageWithAccount[]> {
    return this.prismaService.message.findMany({
      where: {
        streamId,
      },
      take: limit,
      skip: 1,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
      }),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        account: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async getAccountById(userId: string) {
    return await this.prismaService.account.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
