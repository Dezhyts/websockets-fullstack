import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Account, Stream } from '@prisma/generated/client';

export type StreamPick = Pick<Stream, 'id' | 'title' | 'accountId'>;

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStreamByStreamId(streamId: string): Promise<StreamPick | null> {
    return this.prisma.stream.findUnique({
      where: { id: streamId },
      select: {
        id: true,
        title: true,
        accountId: true,
      },
    });
  }

  async findStreamByUsername(username: string): Promise<StreamPick | null> {
    return this.prisma.stream.findFirst({
      where: {
        account: {
          username: {
            equals: username,
            mode: 'insensitive',
          },
        },
      },
      select: {
        id: true,
        title: true,
        accountId: true,
      },
    });
  }

  async findStreamByAccountId(accountId: string): Promise<StreamPick | null> {
    return this.prisma.stream.findFirst({
      where: { accountId },
      select: {
        id: true,
        title: true,
        accountId: true,
      },
    });
  }

  async findAccountByUserId(userId: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id: userId },
    });
  }

  async createUniqueStream(
    accountId: string,
    roomName: string,
    title?: string,
  ): Promise<StreamPick> {
    const streamTitle = title?.trim() || 'Stream';
    return await this.prisma.stream.upsert({
      where: {
        accountId,
      },

      create: {
        id: roomName,
        title: streamTitle,
        accountId,

        status: 'OFFLINE',
      },
      update: {
        id: roomName,
      },
    });
  }
}
