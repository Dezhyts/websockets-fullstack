import { ApiProperty } from '@nestjs/swagger';

export class RegisterDtoResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp',
    description: 'Access token for authorization',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp',
    description: 'Access token for authorization',
  })
  refreshToken: string;
}

export class LoginDtoResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp',
    description: 'Access token for authorization',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp',
    description: 'Access token for authorization',
  })
  refreshToken: string;
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
