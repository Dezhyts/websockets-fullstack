import { ErrorResponseDto } from '@modules/media/dto/media.dto';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { ApiStandardErrors } from '@shared/decorators/api-errors.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthRequestGuard } from '@shared/guard/request/auth.request.guard';
import { RolesRequestGuard } from '@shared/guard/request/roles.request.guard';
import { NotificationService } from './notification.service';
import { Roles } from '@shared/decorators/roles-decorator';
import { Role } from '@prisma/generated/enums';

@Controller('notification')
@ApiStandardErrors(ErrorResponseDto)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthRequestGuard, RolesRequestGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiOkResponse()
  @Get('notifications')
  async getNotifications(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit: number,
  ) {
    return this.notificationService.getNotificationsByUser(userId, limit);
  }
}
