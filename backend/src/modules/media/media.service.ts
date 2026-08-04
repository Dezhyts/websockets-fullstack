import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccessToken,
  IngressClient,
  WebhookReceiver,
  IngressVideoEncodingPreset,
  IngressInput,
  IngressVideoOptions,
  IngressAudioEncodingPreset,
  IngressAudioOptions,
} from 'livekit-server-sdk';

@Injectable()
export class MediaService {
  private readonly webhookReceiver: WebhookReceiver;
  private readonly ingressClient: IngressClient;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly livekitUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('LIVEKIT_API_KEY');
    this.apiSecret =
      this.configService.getOrThrow<string>('LIVEKIT_API_SECRET');
    this.livekitUrl = this.configService.getOrThrow<string>('LIVEKIT_URL');

    this.webhookReceiver = new WebhookReceiver(this.apiKey, this.apiSecret);
    this.ingressClient = new IngressClient(
      this.livekitUrl,
      this.apiKey,
      this.apiSecret,
    );
  }

  async generateToken(
    roomName: string,
    participant: string,
    canPublish: boolean,
  ) {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participant,
      ttl: '2h',
    });

    at.addGrant({
      room: roomName,
      canPublish: canPublish,
      canSubscribe: true,
      roomJoin: true,
    });

    const tokenString = await at.toJwt();

    return { token: tokenString };
  }

  async createIngress(roomName: string, streamId: string) {
    try {
      const ingress = await this.ingressClient.createIngress(
        IngressInput.RTMP_INPUT,
        {
          roomName: roomName,
          participantIdentity: streamId,
          video: new IngressVideoOptions({
            encodingOptions: {
              case: 'preset',
              value: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
            },
          }),

          audio: new IngressAudioOptions({
            encodingOptions: {
              case: 'preset',
              value: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
            },
          }),
        },
      );

      const fallbackUrl = 'rtmp://localhost:1935/x';

      return {
        ingressId: ingress.ingressId,
        streamKey: ingress.streamKey,
        streamUrl: ingress.url || fallbackUrl,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async handleWebhook(rawBody: Buffer, authHeader: string) {
    try {
      const rawBodyString = rawBody.toString('utf8');
      const event = await this.webhookReceiver.receive(
        rawBodyString,
        authHeader,
      );
      switch (event.event) {
        case 'room_started':
          console.log('Hello');
          break;

        case 'room_finished':
          console.log('Room finished');
          break;

        case 'track_published':
          console.log('Track published');
          break;

        case 'participant_joined':
          console.log(
            ` Зритель ${event.participant?.identity} присоединился к комнате`,
          );
          break;

        case 'participant_left':
          console.log(`Зритель ${event.participant?.identity} покинул комнату`);
          break;

        case 'ingress_started':
          console.log(
            `🔴 Стрим начался! Ingress ID: ${event.ingressInfo?.ingressId}`,
          );
          console.log(`Комната: ${event.ingressInfo?.roomName}`);
          console.log(
            `ID Стримера (Identity): ${event.ingressInfo?.participantIdentity}`,
          );

          break;

        case 'ingress_ended':
          console.log(
            `⏹️ Стрим завершен! Ingress ID: ${event.ingressInfo?.ingressId}`,
          );
          break;
      }

      return { success: true };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid livekit webhook token');
    }
  }
}
