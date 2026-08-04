import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinStreamDto {
  @ApiProperty({
    description: 'Id stream(room) to join',
    example: 'stream_34567',
  })
  @IsNotEmpty()
  @IsString()
  streamId: string;
}

export class LeaveStreamDto {
  @ApiProperty({
    description: 'Id stream(room) to leave',
    example: 'stream_12345',
  })
  @IsNotEmpty()
  @IsString()
  streamId: string;
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Id stream(room) where send message',
    example: 'stream_12345',
  })
  @IsNotEmpty()
  streamId: string;

  @ApiProperty({
    description: 'Text message to send',
    example: 'Hello!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
