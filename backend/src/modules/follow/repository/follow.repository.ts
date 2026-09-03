import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Follower } from '@prisma/generated/client';

@Injectable()
export class FollowRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async toggleSubscription(
    accountId: string,
    streamerId: string,
  ): Promise<Follower | null> {
    const existingSubscribe = await this.prismaService.follower.findUnique({
      where: {
        followingId_streamerId: {
          followingId: accountId,
          streamerId,
        },
      },
    });

    if (existingSubscribe) {
      await this.prismaService.follower.delete({
        where: {
          followingId_streamerId: { followingId: accountId, streamerId },
        },
      });
      return null;
    } else {
      return await this.prismaService.follower.create({
        data: {
          followingId: accountId,
          streamerId,
        },
      });
    }
  }
}
