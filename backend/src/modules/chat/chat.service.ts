import { Injectable } from '@nestjs/common';
import {
  ChatUser,
  MessagePayload,
  UserJoinedPayload,
} from './types/chat.types';

@Injectable()
export class ChatService {
  buildUserJoinedPayload(user: ChatUser): UserJoinedPayload {
    return {
      userId: user.id,
      username: user.username,
    };
  }

  buildMessagePayload(user: ChatUser, message: string): MessagePayload {
    return {
      userId: user.id,
      username: user.username,
      message,
      createdAt: new Date().toISOString(),
    };
  }
  getRoom(streamId: string): string {
    return `stream:${streamId}`;
  }
}
