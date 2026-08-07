import { Injectable } from '@nestjs/common';
import {
  ChatUser,
  MessagePayload,
  UserJoinedPayload,
} from './types/chat.types';
import { ChatRepository } from './repository/chat.repository';
import { JoinStreamDto, SendMessageDto } from './dto/chat-dto';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}
  buildUserJoinedPayload(user: ChatUser): UserJoinedPayload {
    return {
      userId: user.id,
      username: user.username,
    };
  }

  getRoom = (streamId: string): string => `stream:${streamId}`;

  async createAndSaveMessage(
    data: SendMessageDto,
    userId: string,
  ): Promise<MessagePayload> {
    const { message, streamId } = data;
    const savedMessage = await this.chatRepository.createMessage({
      text: message,
      stream: {
        connect: {
          id: streamId,
        },
      },
      account: {
        connect: { id: userId },
      },
    });
    return {
      userId: savedMessage.accountId ?? userId,
      username: savedMessage.account?.username ?? '',
      message: savedMessage.text || '',
      createdAt: savedMessage.createdAt.toISOString(),
    };
  }

  async getHistoryMessageFromUser(data: JoinStreamDto) {
    const { streamId, limit = 20 } = data;
    const historyMessage = await this.chatRepository.getMessagesByStream(
      streamId,
      limit,
    );

    if (!historyMessage) {
      return [];
    }

    return historyMessage.map((msg) => ({
      userId: msg.accountId ?? '',
      message: msg.text || '',
      createdAt: msg.createdAt.toISOString(),
      username: msg.account?.username ?? 'System',
    }));
  }
}
