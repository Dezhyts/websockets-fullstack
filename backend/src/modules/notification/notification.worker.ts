import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Job } from 'bullmq';

interface StartNotificationJobData {
  streamId: string;
  streamerId: string;
  title: string;
}
@Processor('stream-notifications')
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<StartNotificationJobData>) {
    this.logger.log(`[Worker] Received job ${job.id} of type ${job.name}`);
    if (job.name === 'notify_stream_start') {
      const { streamId, streamerId, title } = job.data;

      this.logger.log(`Sending notifications for followers ${job.id}`);

      const notifications = await this.notificationService.createNotifications(
        streamId,
        streamerId,
        title,
      );

      for (const notification of notifications) {
        try {
          this.notificationService.sendNotificationToGateway(
            notification.accountId,
            notification,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send socket notification: ${notification.id}`,
            error,
          );
        }
        this.logger.log(`Notification dispatched ${notifications.length}`);
      }
    }
  }
}
