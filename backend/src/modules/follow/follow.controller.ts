import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthRequestGuard } from '@shared/guard/request/auth.request.guard';
import { FollowResponseDto } from './dto/follow.response';
import { FollowService } from './follow.service';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('toggle/:username')
  @UseGuards(AuthRequestGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: FollowResponseDto })
  async toggleSubscription(
    @CurrentUser('sub') userId: string,
    @Param('username') username: string,
  ) {
    return await this.followService.toggleSubscription(userId, username);
  }
}
