import { ApiProperty } from '@nestjs/swagger';

export class FollowResponseDto {
  @ApiProperty({
    example: true,
    description: 'Status follow',
  })
  isNotified: boolean;
}
