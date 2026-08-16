import { ChatService } from '@modules/chat/chat.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsStreamBanGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    const payload = context.switchToWs().getData<{ streamId: string }>();

    const userId = client.user?.sub;

    if (!userId) {
      return false;
    }

    const isBanned = await this.chatService.isBannedUser(
      payload.streamId,
      userId,
    );

    if (isBanned) {
      throw new ForbiddenException('You are banned from this stream');
    }

    return true;
  }
}
