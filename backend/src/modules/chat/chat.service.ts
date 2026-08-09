import { Injectable } from '@nestjs/common';
import { JoinStreamDto, SendMessageDto } from './dto/chat-dto';
import {
  ChatRepository,
  MessageWithAccount,
} from './repository/chat.repository';
import { ChatUser } from './types/chat.types';
import { ChatRedisRepository } from './repository/chat-redis.repository';

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

    return {
      userId: savedMessage.accountId ?? userId,
      username: savedMessage.account?.username ?? '',
      message: savedMessage.text || '',
      createdAt: savedMessage.createdAt.toISOString(),
      replyTo: savedMessage.replyTo
        ? {
            id: savedMessage.replyTo.id,
            message: savedMessage.replyTo.text,
            username: savedMessage.replyTo.account?.username ?? '',
          }
        : null,
    };
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

  private mapMessage = (msg: MessageWithAccount) => ({
    id: msg.id,
    username: msg.account?.username ?? 'Guest',
    userId: msg.accountId ?? '',
    message: msg.text || '',
    createdAt:
      typeof msg.createdAt === 'string'
        ? msg.createdAt
        : msg.createdAt.toISOString(),

    replyTo: msg.replyTo
      ? {
          id: msg.replyTo.id,
          message: msg.replyTo.text,
          username: msg.replyTo.account?.username ?? '',
        }
      : null,
  });
}
