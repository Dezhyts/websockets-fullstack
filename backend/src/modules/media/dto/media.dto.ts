import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'conference-room-101',
    required: true,
    description: 'Room name',
  })
  roomName: string;

  @ApiProperty({
    description: 'Participant name',
    example: 'john_doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  user: string;
}
