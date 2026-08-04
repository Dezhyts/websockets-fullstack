import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './repository/auth.repository';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import bcrypt from 'bcrypt';
import { JwtPayload } from '@shared/consts/jwt';
import { AuthRedisRepository } from './repository/auth-redis.repository';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authRedisRepository: AuthRedisRepository,
  ) {}

  async registerAccount(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 8);

    const account = await this.authRepository.createAccount({
      ...data,
      password: hashedPassword,
    });

    if (!account) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateToken({
      sub: account.id,
      email: account.email,
      role: account.role,
    });

    await this.authRedisRepository.setRefreshToken(
      account.id,
      tokens.refreshToken,
      this.getTtlSeconds(),
    );

    return tokens;
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

    const tokens = await this.generateToken({
      sub: account.id,
      email: account.email,
      role: account.role,
    });

    await this.authRedisRepository.setRefreshToken(
      account.id,
      tokens.refreshToken,
      this.getTtlSeconds(),
    );

    return tokens;
  }
  async refreshToken(data: RefreshTokenDto) {
    const { refreshToken } = data;
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      const getRefreshToken = await this.authRedisRepository.getRefreshToken(
        payload.sub,
      );

      if (getRefreshToken !== refreshToken || !getRefreshToken)
        throw new UnauthorizedException('Invalid or expired refresh token');

      const account = await this.authRepository.findById(payload.sub);
      if (!account) throw new UnauthorizedException('Invalid credentials');

      const tokens = await this.generateToken({
        sub: account.id,
        email: account.email,
        role: account.role,
      });

      await this.authRedisRepository.setRefreshToken(
        account.id,
        tokens.refreshToken,
        this.getTtlSeconds(),
      );

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  async logoutAccount(userId: string) {
    await this.authRedisRepository.deleteRefreshToken(userId);

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

  private getTtlSeconds(): number {
    const ttlSeconds = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    return Math.floor(ms(ttlSeconds as StringValue) / 1000);
  }
}
