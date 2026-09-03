import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/generated/client';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './repository/notification.repository';
import { Emitter } from '@socket.io/redis-emitter';
import { REDIS_EMITTER } from '@infrastructure/redis-emitter/redis-emitter.module';

export type NotificationPayload = Prisma.NotificationCreateManyInput;

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
    @Inject(REDIS_EMITTER) private readonly emitter: Emitter,
  ) {}

  async createNotifications(
    streamId: string,
    streamerId: string,
    title: string,
  ) {
    return this.notificationRepository.createNotificationsForFollowers(
      streamId,
      streamerId,
      title,
    );
  }

  sendNotificationToGateway(userId: string, payload: NotificationPayload) {
    this.emitter
      .of('/notificaitons')
      .to(`user:${userId}`)
      .emit('notification', payload);
  }

  async getNotificationsByUser(accountId: string, limit: number) {
    return this.notificationRepository.getNotificationsByUser(accountId, limit);
  }
}
