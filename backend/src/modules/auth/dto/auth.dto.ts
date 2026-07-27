import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'alexbibi',
    description: 'Unique username for account',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    example: 'vladis@gmail.com',
    description: 'User email for registration',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123&',
    description: 'Strong password for registration',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password is too weak. Must contain uppercase, lowercase, number and symbol.',
    },
  )
  password: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'alexbibi or vladis@gmail.com',
    description: 'Enter your unique username or registered email',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  identity: string;

  @ApiProperty({
    example: 'Password123&',
    description: 'User password for login',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh_token',
    description: 'Refresh token for login',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
