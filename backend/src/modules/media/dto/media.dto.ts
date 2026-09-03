import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GetTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'alexbibi',
    required: true,
    description: 'Username of the streamer',
  })
  username: string;
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

export class CreateIngressDto {
  @IsString()
  @ApiPropertyOptional({
    example: 'We are playing through Dark Souls right now',
  })
  @IsOptional()
  @MaxLength(70)
  title?: string;
}
