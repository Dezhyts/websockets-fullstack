import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { GetTokenDto } from './dto/media.dto';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.mediaService.handleWebhook(body, authHeader);
  }

  @Get('token')
  async getToken(@Query() query: GetTokenDto) {
    return this.mediaService.generateToken(query.roomName, query.user);
  }
}
