import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GetTokenDto, IngressDto } from './dto/media.dto';
import { MediaService } from './media.service';
import { Roles } from '@shared/decorators/roles-decorator';
import { Role } from '@shared/consts/roles.enum';
import { StreamRoleGuard } from '@shared/guard/stream-role.guard';
import type { UserRequest } from '@shared/consts/types';
import { RawBody } from '@shared/decorators/raw-body.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('authorization') authHeader: string,
  ) {
    return this.mediaService.handleWebhook(rawBody, authHeader);
  }
  @Roles(Role.STREAMER, Role.VIEWER)
  @UseGuards(StreamRoleGuard)
  @Get('token')
  async getToken(@Query() query: GetTokenDto, @Req() req: UserRequest) {
    const canPublish = req.canPublish ?? false;
    return this.mediaService.generateToken(
      query.roomName,
      query.user,
      canPublish,
    );
  }

  @Post('ingress')
  async createIngress(@Body() body: IngressDto) {
    return this.mediaService.createIngress(body.roomName, body.streamId);
  }
}
