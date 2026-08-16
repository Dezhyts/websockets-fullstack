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
import { ErrorResponseDto, GetTokenDto, IngressDto } from './dto/media.dto';
import { MediaService } from './media.service';
import { Roles } from '@shared/decorators/roles-decorator';
import { StreamRoleGuard } from '@shared/guard/stream-role.guard';
import { RawBody } from '@shared/decorators/raw-body.decorator';
import type { Request } from 'express';
import { Role } from '@prisma/generated/enums';
import { AuthGuard } from '@shared/guard/auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  CreateIngressResponseDto,
  GetTokenResponseDto,
} from './dto/media.response.dto';
import { ApiStandardErrors } from '@shared/decorators/api-errors.decorator';
import { OptionalAuthGuard } from '@shared/guard/optional.auth.guard';

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

  @Roles(Role.STREAMER, Role.USER)
  @UseGuards(OptionalAuthGuard, StreamRoleGuard)
  @ApiStandardErrors()
  @ApiOkResponse({ type: GetTokenResponseDto })
  @Get('token')
  async getToken(@Query() query: GetTokenDto, @Req() req: Request) {
    const isOwner = req.canPublish ?? false;
    const isAuth = !!req.user;
    const username = req.user?.email ?? 'anonim';

    const streamToken = await this.mediaService.generateToken(
      query.roomName,
      username,
      isOwner,
    );

    return {
      streamToken: streamToken,
      isOwner: isOwner,
      isAuth,
    };
  }

  @Post('ingress')
  @Roles(Role.STREAMER, Role.USER, Role.ADMIN)
  @ApiOkResponse({ type: CreateIngressResponseDto })
  @ApiStandardErrors(ErrorResponseDto)
  @UseGuards(AuthGuard, StreamRoleGuard)
  async createIngress(
    @Body() body: IngressDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.mediaService.createIngress(body.roomName, userId);
  }
}
