import { RedisService } from '@infrastructure/redis/redis.service';
import { Injectable } from '@nestjs/common';
@Injectable()
export class AuthRedisRepository {
  constructor(private readonly redisService: RedisService) {}

  public async setRefreshToken(
    userId: string,
    refreshToken: string,
    ttlSeconds: number,
  ) {
    const key = `auth:refreshToken:${userId}`;

    await this.redisService.client.set(key, refreshToken, 'EX', ttlSeconds);
  }

  public async getRefreshToken(userId: string) {
    const key = `auth:refreshToken:${userId}`;

    return await this.redisService.client.get(key);
  }
  public async deleteRefreshToken(userId: string): Promise<void> {
    const key = `auth:refreshToken:${userId}`;

    await this.redisService.client.del(key);
  }
}
