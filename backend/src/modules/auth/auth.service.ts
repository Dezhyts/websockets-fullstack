import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './repository/auth.repository';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import bcrypt from 'bcrypt';
import { JwtPayload } from '@shared/consts/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async registerAccount(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const account = await this.authRepository.createAccount({
      ...data,
      password: hashedPassword,
    });

    if (!account) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken({
      sub: account.id,
      email: account.email,
      role: account.role,
    });
  }
  async loginAccount(data: LoginDto) {
    const account = await this.authRepository.findByIdentity(data.identity);

    if (!account) throw new UnauthorizedException('Invalid credentials');

    const isPasswordMatch = await bcrypt.compare(
      data.password,
      account.password,
    );

    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateToken({
      sub: account.id,
      email: account.email,
      role: account.role,
    });
  }
  async refreshToken(data: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        data.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      const account = await this.authRepository.findById(payload.sub);
      if (!account) throw new UnauthorizedException('Invalid credentials');

      return this.generateToken({
        sub: account.id,
        email: account.email,
        role: account.role,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  logoutAccount(userId: string) {
    return { success: true };
  }

  private async generateToken(payload: JwtPayload) {
    const accessTokenPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    const refreshTokenPayload = {
      sub: payload.sub,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
          'JWT_ACCESS_EXPIRES_IN',
        ),
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
