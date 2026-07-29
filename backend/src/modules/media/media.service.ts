import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, WebhookReceiver } from 'livekit-server-sdk';

@Injectable()
export class MediaService {
  private readonly webhookReceiver: WebhookReceiver;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('LIVEKIT_API_KEY');
    this.apiSecret =
      this.configService.getOrThrow<string>('LIVEKIT_API_SECRET');

    this.webhookReceiver = new WebhookReceiver(this.apiKey, this.apiSecret);
  }

  async generateToken(roomName: string, participant: string) {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
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

  async handleWebhook(rawBody: string, authHeader: string) {
    try {
      const event = await this.webhookReceiver.receive(rawBody, authHeader);

      switch (event.event) {
        case 'room_started':
          console.log('Hello');

          break;

        case 'room_finished':
          console.log('Room finished');
          break;
      }

      return { success: true };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid livekit webhook token');
    }
  }
}
