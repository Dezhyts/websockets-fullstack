import { RedisService } from '@infrastructure/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { MessageWithAccount } from './chat.repository';

@Injectable()
export class ChatRedisRepository {
  constructor(private readonly redisService: RedisService) {}

  public async rpushMessage(
    streamId: string,
    message: MessageWithAccount,
  ): Promise<void> {
    const key = `chat:stream:${streamId}:messages`;

    const messageString = JSON.stringify(message);

    await this.redisService.client
      .pipeline()
      .rpush(key, messageString)
      .ltrim(key, -100, -1)
      .expire(key, 60 * 60 * 6)
      .exec();
  }

  public async lrangeMessage(streamId: string): Promise<MessageWithAccount[]> {
    const key = `chat:stream:${streamId}:messages`;

    const cachedMessages = await this.redisService.client.lrange(key, 0, -1);

    if (!cachedMessages || cachedMessages.length === 0) {
      return [];
    }

    return cachedMessages.map(
      (message) => JSON.parse(message) as MessageWithAccount,
    );
  }

  public async lremMessage(
    streamId: string,
    message: MessageWithAccount,
  ): Promise<void> {
    const key = `chat:stream:${streamId}:messages`;
    const messageString = JSON.stringify(message);

    await this.redisService.client.lrem(key, 1, messageString);
  }
}
