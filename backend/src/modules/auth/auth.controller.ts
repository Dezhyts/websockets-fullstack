import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import {
  LoginDtoResponse,
  LogoutDtoResponse,
  RefreshDtoResponse,
  RegisterDtoResponse,
} from './dto/auth-response.dto';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthGuard } from '@shared/guard/auth.guard';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms'; // 1. ДОБАВИЛИ ИМПОРТ MS

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'User registration',
    description: 'User registration',
  })
  @ApiResponse({ status: 201, type: RegisterDtoResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerAccount(body);
    this.setRefreshToken(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @ApiOperation({
    summary: 'User registration',
    description: 'User registration',
  })
  @ApiResponse({ status: 200, type: LoginDtoResponse })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginAccount(body);
    this.setRefreshToken(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @ApiOperation({
    summary: 'User registration',
    description: 'Refresh token',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: RefreshDtoResponse })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refreshToken'] as string;

    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not found in cookies');

    const token = await this.authService.refreshToken({ refreshToken });
    this.setRefreshToken(res, token.refreshToken);

    return { accessToken: token.accessToken };
  }

  @ApiOperation({
    summary: 'Logout user',
    description: 'Logout from account',
  })
  @ApiResponse({ status: 200, type: LogoutDtoResponse })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('logout')
  logout(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = this.authService.logoutAccount(userId);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') !== 'development',
      sameSite: 'lax',
    });

    return { success: result };
  }

  private setRefreshToken(res: Response, refreshToken: string) {
    const expiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') !== 'development',
      sameSite: 'lax',
      maxAge: ms(expiresIn as StringValue),
    });
  }
}
