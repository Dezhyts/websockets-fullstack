import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDtoResponse {
  @ApiProperty({
    example: 'c4a0193b3.',
    description: 'Unique id for account',
  })
  id: string;

  @ApiProperty({
    example: 'vladis@gmail.com',
    description: 'User email for registration',
  })
  email: string;

  @ApiProperty({
    example: 'alexbibi',
    description: 'Unique username for account',
  })
  username: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp',
    description: 'Access token for authorization',
  })
  accessToken: string;

  @ApiProperty({
    example: '2026-07-25T14:10:00.000Z',
    description: 'Date of account creation',
  })
  createdAt: Date;
}

export class LoginDtoResponse {
  @ApiProperty({
    example: 'c4a0193b3.',
    description: 'Unique id for account',
  })
  id: string;

  @ApiProperty({
    example: 'vladis@gmail.com',
    description: 'User email for account',
  })
  email: string;

  @ApiProperty({
    example: 'alexbibi',
    description: 'Unique username for account',
  })
  username: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp',
    description: 'Access token for authorization',
  })
  accessToken: string;

  @ApiProperty({
    example: '2026-07-25T14:10:00.000Z',
    description: 'Date of account creation',
  })
  createdAt: Date;
}

export class LogoutDtoResponse {
  @ApiProperty({
    example: true,
    description: 'Logout status',
  })
  success: boolean;
}

export class RefreshDtoResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp',
    description: 'New access token for authorization',
  })
  accessToken: string;
}
