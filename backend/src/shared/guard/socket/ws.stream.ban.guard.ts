import { ChatService } from '@modules/chat/chat.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsStreamBanGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const payload = context.switchToWs().getData<{ streamId: string }>();
    const userId = client.user?.sub;

    if (!userId) {
      return true;
    }

    const streamId = decodeURIComponent(payload.streamId);

    const isBanned = await this.chatService.isBannedUser(streamId, userId);

    if (isBanned) {
      throw new WsException('You are banned from this stream');
    }

    return true;
  }
}
