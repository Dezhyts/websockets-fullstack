import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Message, Prisma } from '@prisma/generated/client';
import { MessageCreateInput } from '@prisma/generated/models';

export type MessageWithAccount = Prisma.MessageGetPayload<{
  include: {
    account: { select: { id: true; username: true } };
  };
}>;

@Injectable()
export class ChatRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createMessage(data: MessageCreateInput): Promise<MessageWithAccount> {
    return this.prismaService.message.create({
      data,
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
  async getMessagesByStream(
    streamId: string,
    limit: number,
  ): Promise<MessageWithAccount[] | null> {
    return this.prismaService.message.findMany({
      where: {
        streamId,
      },
      take: limit,
      orderBy: {
        createdAt: 'asc',
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
}
