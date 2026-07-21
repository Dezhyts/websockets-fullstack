import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {}

  async generateToken(roomName: string, participant: string) {
    const apiKey = this.configService.getOrThrow<string>('LIVEKIT_API_KEY');
    const apiSecret =
      this.configService.getOrThrow<string>('LIVEKIT_API_SECRET');
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participant,
    });

    at.addGrant({
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      roomJoin: true,
    });

    const tokenString = await at.toJwt();

    return { token: tokenString };
  }
}
