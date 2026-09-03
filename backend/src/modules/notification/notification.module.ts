import { NotificationGateway } from './notification.gateway';
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationWorker } from './notification.worker';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationController } from './notification.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'stream-notifications',
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationGateway,
    NotificationWorker,
  ],
  exports: [NotificationService, NotificationRepository, NotificationGateway],
})
export class NotificationModule {}
