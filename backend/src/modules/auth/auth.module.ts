import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './repository/auth.repository';
import { AuthRedisRepository } from './repository/auth-redis.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, AuthRedisRepository],
})
export class AuthModule {}
