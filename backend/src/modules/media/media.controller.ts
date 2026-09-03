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
import { ApiOkResponse } from '@nestjs/swagger';
import { Role } from '@prisma/generated/enums';
import { ApiStandardErrors } from '@shared/decorators/api-errors.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { Roles } from '@shared/decorators/roles-decorator';
import { AuthRequestGuard } from '@shared/guard/request/auth.request.guard';
import { OptionalAuthRequestGuard } from '@shared/guard/request/optional.auth.request.guard';
import { RolesRequestGuard } from '@shared/guard/request/roles.request.guard';
import { randomBytes } from 'crypto';
import type { Request } from 'express';
import {
  CreateIngressDto,
  ErrorResponseDto,
  GetTokenDto,
} from './dto/media.dto';
import {
  CreateIngressResponseDto,
  GetTokenResponseDto,
} from './dto/media.response.dto';
import { MediaService } from './media.service';

@Controller('media')
@ApiStandardErrors(ErrorResponseDto)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('authorization') authHeader: string,
  ) {
    const rawBody = req.rawBody!;

    return this.mediaService.handleWebhook(rawBody, authHeader);
  }

  @UseGuards(OptionalAuthRequestGuard)
  @ApiOkResponse({ type: GetTokenResponseDto })
  @Get('token')
  async getToken(@Query() query: GetTokenDto, @Req() req: Request) {
    const userId = req.user?.sub;
    const username =
      req.user?.username ?? `anon_${randomBytes(4).toString('hex')}`;

    const decodedQueryName = decodeURIComponent(query.username);

    const { streamToken, roomName, canPublish } =
      await this.mediaService.generateToken(decodedQueryName, username, userId);

    return {
      streamToken,
      roomName,
      canPublish,
      isAuth: !!userId,
    };
  }

  @Post('ingress')
  @UseGuards(AuthRequestGuard, RolesRequestGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ type: CreateIngressResponseDto })
  @ApiStandardErrors(ErrorResponseDto)
  async createIngress(
    @CurrentUser('sub') userId: string,
    @Body() data: CreateIngressDto,
  ) {
    return this.mediaService.createIngress(userId, data.title);
  }
}
