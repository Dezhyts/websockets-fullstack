import { Injectable } from '@nestjs/common';
import { BanUserDto, JoinStreamDto, SendMessageDto } from './dto/chat-dto';
import {
  ChatRepository,
  MessageWithAccount,
} from './repository/chat.repository';
import { ChatUser } from './types/chat.types';
import { ChatRedisRepository } from './repository/chat-redis.repository';
import { DurationBan } from '@shared/common/types/duration.ban.enum';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly сhatRedisRepository: ChatRedisRepository,
  ) {}
  buildUserJoinedPayload(user: ChatUser) {
    return {
      userId: user.id,
      username: user.username,
    };
  }

  getRoom = (streamId: string) => `stream:${streamId}`;

  async createMessage(data: SendMessageDto, userId: string) {
    const { message, streamId, replyToId } = data;

    const savedMessage = await this.chatRepository.createMessage({
      text: message,
      streamId,
      accountId: userId,
      replyToId: replyToId,
    });

    await this.сhatRedisRepository.rpushMessage(streamId, savedMessage);

    return this.mapMessage(savedMessage);
  }

  async getHistoryMessageFromUser(data: JoinStreamDto) {
    const { streamId, limit = 20 } = data;

    const cachedMessages =
      await this.сhatRedisRepository.lrangeMessage(streamId);

    if (cachedMessages.length > 0) {
      return {
        messages: cachedMessages.slice(-limit).map(this.mapMessage),
      };
    }

    const dbMessages = await this.chatRepository.getMessagesByStream(
      streamId,
      limit,
    );

    for (const message of [...dbMessages].reverse()) {
      await this.сhatRedisRepository.rpushMessage(streamId, message);
    }

    return {
      messages: dbMessages.map(this.mapMessage),
    };
  }

  async getAccountById(userId: string) {
    return await this.chatRepository.getAccountById(userId);
  }

  async banUser(data: BanUserDto, bannedBy: string) {
    const { streamId, targetUserIdBan, duration } = data;

    if (duration === DurationBan.PERMANENT) {
      await this.chatRepository.createPermanentUserBan(
        streamId,
        targetUserIdBan,
        bannedBy,
      );

      await this.сhatRedisRepository.setBanUser(
        streamId,
        targetUserIdBan,
        7200,
      );
    } else {
      await this.сhatRedisRepository.setBanUser(
        streamId,
        targetUserIdBan,
        Number(duration),
      );
    }
  }

  async isBannedUser(streamId: string, userId: string) {
    const isTemporaryRedisBanned = await this.сhatRedisRepository.getBanUser(
      streamId,
      userId,
    );

    if (isTemporaryRedisBanned) {
      return true;
    }
    const isPermanentDbBanned = await this.chatRepository.checkedUserBan(
      streamId,
      userId,
    );

    if (isPermanentDbBanned) {
      await this.сhatRedisRepository.setBanUser(streamId, userId, 7200);

      return true;
    }

    return false;
  }

  private mapMessage = (msg: MessageWithAccount) => ({
    id: msg.id,
    username: msg.account?.username ?? 'Guest',
    userId: msg.accountId ?? '',
    message: msg.text || '',
    createdAt: new Date(msg.createdAt).toISOString(),
    replyTo: msg.replyTo
      ? {
          id: msg.replyTo.id,
          message: msg.replyTo.text || '',
          username: msg.replyTo.account?.username ?? '',
        }
      : null,
  });
}
