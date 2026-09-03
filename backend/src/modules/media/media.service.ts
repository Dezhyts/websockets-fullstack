import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
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
import { MediaRepository } from './repository/media.repository';
import { randomBytes } from 'crypto';

@Injectable()
export class MediaService {
  private readonly webhookReceiver: WebhookReceiver;
  private readonly ingressClient: IngressClient;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly livekitUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly mediaRepository: MediaRepository,
    @InjectQueue('stream-notifications')
    private readonly notificationQueue: Queue,
  ) {
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

  async generateToken(username: string, viewer: string, userId?: string) {
    const stream = await this.mediaRepository.findStreamByUsername(username);

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }
    const canPublish = Boolean(userId && stream.accountId === userId);

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: viewer,
      ttl: '2h',
    });

    at.addGrant({
      room: stream.id,
      canPublish: canPublish,
      canSubscribe: true,
      roomJoin: true,
      canPublishData: true,
    });

    const streamToken = await at.toJwt();

    return {
      streamToken,
      canPublish,
      roomName: stream.id,
    };
  }

  async createIngress(userId: string, title?: string) {
    try {
      const account = await this.mediaRepository.findAccountByUserId(userId);

      if (!account) {
        throw new BadRequestException('Пользователь не найден');
      }

      const generateRoomName = `stream_${randomBytes(4).toString('hex')}`;

      const ingress = await this.ingressClient.createIngress(
        IngressInput.RTMP_INPUT,
        {
          roomName: generateRoomName,
          participantIdentity: userId,
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

      if (!ingress) {
        throw new BadRequestException('Ingress not created');
      }

      await this.mediaRepository.createUniqueStream(
        userId,
        generateRoomName,
        title,
      );

      return {
        ingressId: ingress.ingressId,
        streamKey: ingress.streamKey,
        streamUrl: `${this.configService.getOrThrow<string>('RTMP_BASE_URL')}/${ingress.streamKey}`,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async handleWebhook(rawBody: Buffer, authHeader: string) {
    try {
      if (!rawBody) {
        throw new BadRequestException('Raw body is missing');
      }
      const rawBodyString =
        rawBody instanceof Buffer ? rawBody.toString('utf8') : String(rawBody);

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

        case 'ingress_started': {
          const streamerId = event.ingressInfo?.participantIdentity;
          const roomName = event.ingressInfo?.roomName;

          if (!streamerId || !roomName) {
            console.warn(
              'Cannot process notification: streamerId is undefined',
            );
            break;
          }

          const stream =
            await this.mediaRepository.findStreamByAccountId(streamerId);

          if (!stream || !stream.id || !stream.title) {
            console.warn(
              `Stream record not found for streamerId: ${streamerId}`,
            );
            break;
          }
          await this.notificationQueue.add('notify_stream_start', {
            streamId: stream.id,
            streamerId,
            title: stream.title,
          });
          console.log('Job added to Redis');
          break;
        }

        case 'ingress_ended':
          console.log(
            `Стрим завершен! Ingress ID: ${event.ingressInfo?.ingressId}`,
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
