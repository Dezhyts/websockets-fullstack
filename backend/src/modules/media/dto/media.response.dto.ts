import { ApiProperty } from '@nestjs/swagger';

export class GetTokenResponseDto {
  @ApiProperty({
    example: 'stream_token',
    description: 'stream token for authorization user',
  })
  streamToken: string;

  @ApiProperty({
    example: true,
    description: 'User can stream',
  })
  isOwner: boolean;

  @ApiProperty({
    example: true,
    description: 'User is auth',
  })
  isAuth: boolean;
}

export class CreateIngressResponseDto {
  @ApiProperty({ example: 'IN_id' })
  ingressId: string;

  @ApiProperty({ example: 'rtmp://localhost:1935/x' })
  url: string;

  @ApiProperty({ example: 'sk-xxxx' })
  streamKey: string;
}
