import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User registration',
    description: 'User registration',
  })
  @ApiResponse({ status: 200, type: RegisterDtoResponse })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.registerAccount();
  }

  @ApiOperation({
    summary: 'User registration',
    description: 'User registration',
  })
  @ApiResponse({ status: 200, type: LoginDtoResponse })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginAccount();
  }

  @ApiOperation({
    summary: 'User registration',
    description: 'Refresh token',
  })
  @ApiResponse({ status: 200, type: RefreshDtoResponse })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken();
  }

  @ApiOperation({
    summary: 'Logout user',
    description: 'Logout from account',
  })
  @ApiResponse({ status: 200, type: LogoutDtoResponse })
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.loginAccount();
  }
}
