import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { BullModule } from '@nestjs/bullmq';
import { MediaRepository } from './repository/media.repository';

@Module({
  imports: [BullModule.registerQueue({ name: 'stream-notifications' })],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
})
export class MediaModule {}
