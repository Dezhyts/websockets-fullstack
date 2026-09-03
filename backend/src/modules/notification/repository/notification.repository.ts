import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Follower } from '@prisma/generated/client';
import { NotificationCreateManyInput } from '@prisma/generated/models';
import * as crypto from 'crypto';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createNotificationsForFollowers(
    streamId: string,
    streamerId: string,
    title: string,
  ): Promise<NotificationCreateManyInput[]> {
    const followers = await this.prisma.follower.findMany({
      where: {
        streamerId,
        isNotified: true,
      },
      select: {
        followingId: true,
      },
    });
    if (followers.length === 0) {
      return [];
    }

    const notificationData = this.mapNotificationsData(
      followers,
      streamId,
      title,
    );

    await this.prisma.notification.createMany({
      data: notificationData,
      skipDuplicates: true,
    });

    return notificationData;
  }

  async getNotificationsByUser(accountId: string, limit: number) {
    return this.prisma.notification.findMany({
      where: { accountId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  private mapNotificationsData(
    followers: Pick<Follower, 'followingId'>[],
    streamId: string,
    title: string,
  ): NotificationCreateManyInput[] {
    return followers.map((follower) => ({
      id: crypto.randomUUID(),
      accountId: follower.followingId,
      streamId: streamId,
      type: 'STREAM_LIVE',
      message: ` ${title}`,
      createdAt: new Date(),
    }));
  }
}
