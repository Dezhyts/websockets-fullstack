import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DurationBan } from '@shared/common/types/duration.ban.enum';

export class JoinStreamDto {
  @ApiProperty({
    description: 'Id stream(room) to join',
    example: 'stream_34567',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => decodeURIComponent(value))
  streamId: string;

  @ApiProperty({
    description: 'Number of messages to get',
    example: 20,
    type: 'number',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit: number;

  @ApiProperty({
    description: 'Cursor for pagination',
    example: 'a5e8494c-83b4-4e48-8dfa-80c10b27f12e',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export class LeaveStreamDto {
  @ApiProperty({
    description: 'Id stream(room) to leave',
    example: 'stream_12345',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => decodeURIComponent(value))
  streamId: string;
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Id stream(room) where send message',
    example: 'stream_12345',
  })
  @IsNotEmpty()
  @Transform(({ value }) => decodeURIComponent(value))
  @IsString()
  streamId: string;

  @ApiProperty({
    description: 'Text message to send',
    example: 'Hello!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Id message to reply',
    example: 'Hello!',
  })
  @IsString()
  @IsOptional()
  replyToId?: string;
}

export class BanUserDto {
  @ApiProperty({
    description: 'Id stream(room) where send message',
    example: 'stream_12345',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => decodeURIComponent(value))
  streamId: string;

  @ApiProperty({
    description: 'Id user to ban',
    example: 'user_12345',
  })
  @IsNotEmpty()
  @IsString()
  targetUserIdBan: string;

  @ApiProperty({
    description: 'Duration of ban',
    example: DurationBan.ONE_HOUR,
  })
  @IsEnum(DurationBan)
  @IsNotEmpty()
  duration: DurationBan;
}
