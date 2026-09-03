import { RedisService } from '@infrastructure/redis/redis.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

const LIMIT = 5;
const WINDOW_SECONDS = 15;

@Injectable()
export class LimitMessageGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    const key = `limitMessage:${client.user?.sub ?? client.id}`;
    const countMessage = await this.redisService.client.incr(key);

    if (countMessage === 1) {
      await this.redisService.client.expire(key, WINDOW_SECONDS);
    }

    if (countMessage > LIMIT) {
      const timeLeft = await this.redisService.client.ttl(key);
      client.emit('error', {
        code: 'LIMIT_MESSAGE',
        message: 'Слишком много сообщений, подождите',
        timeLeft,
        windowSeconds: WINDOW_SECONDS,
      });
      return false;
    }

    return true;
  }
}
