import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDtoResponse {
  @ApiProperty({
    example: 'true',
    description: 'Send message status',
  })
  success: boolean;
}
