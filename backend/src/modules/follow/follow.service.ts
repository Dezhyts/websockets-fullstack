import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FollowRepository } from './repository/follow.repository';
import { AuthRepository } from '@modules/auth/repository/auth.repository';

@Injectable()
export class FollowService {
  constructor(
    private readonly chatRepository: FollowRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async toggleSubscription(accountId: string, username: string) {
    const streamer = await this.authRepository.findByUsername(username);

    if (!streamer) {
      throw new NotFoundException('Streamer not found');
    }
    if (accountId === streamer.id) {
      throw new BadRequestException('You cannot subscribe to yourself');
    }

    const result = await this.chatRepository.toggleSubscription(
      accountId,
      streamer.id,
    );

    if (result === null) {
      return {
        isNotified: false,
      };
    } else {
      return {
        isNotified: true,
      };
    }
  }
}
