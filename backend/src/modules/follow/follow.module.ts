import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { FollowRepository } from './repository/follow.repository';
import { AuthRepository } from '@modules/auth/repository/auth.repository';

@Module({
  controllers: [FollowController],
  providers: [FollowService, FollowRepository, AuthRepository],
})
export class FollowModule {}
