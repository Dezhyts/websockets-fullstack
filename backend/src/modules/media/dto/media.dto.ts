import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
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
}

export class IngressDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'conference-room-101',
    required: true,
    description: 'Room name',
  })
  roomName: string;
}

export class ErrorResponseDto {
  @IsNumber()
  @ApiProperty()
  statusCode: number;

  @IsString()
  @ApiProperty()
  message: string;

  @IsString()
  @ApiProperty()
  error: string;
}
