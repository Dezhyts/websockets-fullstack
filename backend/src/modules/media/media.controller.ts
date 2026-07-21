import { Controller, Get, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { GetTokenDto } from './dto/get-token.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('token')
  async getToken(@Query() query: GetTokenDto) {
    return this.mediaService.generateToken(query.roomName, query.user);
  }
}
