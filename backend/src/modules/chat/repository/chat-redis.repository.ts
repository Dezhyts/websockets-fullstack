import { RedisService } from '@infrastructure/redis/redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatRedisRepositoryy {
  constructor(private readonly redisService: RedisService) {}
}
