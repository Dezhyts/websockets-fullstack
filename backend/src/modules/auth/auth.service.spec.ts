import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthRedisRepository } from './repository/auth-redis.repository';
import { AuthRepository } from './repository/auth.repository';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { Account } from '@prisma/generated/client';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let authRedisRepository: jest.Mocked<AuthRedisRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const configValues: Record<string, string> = {
    JWT_ACCESS_SECRET: 'access_secret',
    JWT_REFRESH_SECRET: 'refresh_secret',
    JWT_ACCESS_EXPIRES_IN: '30m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  };

  const mockAuthRepository = {
    createAccount: jest.fn(),
    findByIdentity: jest.fn(),
    findById: jest.fn(),
  };

  const mockAuthRedisRepository = {
    setRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockAccount: Account = {
    id: 'user_123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER',
    password: 'hashed_password',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => configValues[key]),
  };

  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: AuthRedisRepository, useValue: mockAuthRedisRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get(AuthService);
    authRepository = module.get(AuthRepository);
    authRedisRepository = module.get(AuthRedisRepository);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('registerAccount', () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should hash the password, create the account, save refresh token to redis and return tokens', async () => {
      jest
        .spyOn(mockedBcrypt, 'hash')
        .mockResolvedValue('hashed_password' as never);
      authRepository.createAccount.mockResolvedValue(mockAccount);

      jwtService.signAsync
        .mockResolvedValueOnce('access_token_123')
        .mockResolvedValueOnce('refresh_token_123');

      const result = await authService.registerAccount(registerDto);

      expect(authRepository.createAccount).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed_password',
      });

      expect(authRedisRepository.setRefreshToken).toHaveBeenCalledWith(
        mockAccount.id,
        'refresh_token_123',
        604800,
      );

      expect(result).toEqual({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      });
    });
    it('should throw UnauthorizedException if account creation fails', async () => {
      authRepository.createAccount.mockResolvedValue(
        null as unknown as Account,
      );
      await expect(authService.registerAccount(registerDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(authRedisRepository.setRefreshToken).not.toHaveBeenCalled();
    });
  });
  describe('loginAccount', () => {
    const loginDto: LoginDto = {
      identity: 'testuser',
      password: 'password123',
    };

    it('should validate credentials, save refresh token to redis and return tokens', async () => {
      authRepository.findByIdentity.mockResolvedValue(mockAccount);
      jest.spyOn(mockedBcrypt, 'compare').mockResolvedValue(true as never);

      jwtService.signAsync
        .mockResolvedValueOnce('access_token_123')
        .mockResolvedValueOnce('refresh_token_123');

      const result = await authService.loginAccount(loginDto);

      expect(authRepository.findByIdentity).toHaveBeenCalledWith(
        loginDto.identity,
      );

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockAccount.password,
      );

      expect(authRedisRepository.setRefreshToken).toHaveBeenCalledWith(
        mockAccount.id,
        'refresh_token_123',
        604800,
      );

      expect(result).toEqual({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      });
    });
    it('should throw UnauthorizedException if account is not found', async () => {
      authRepository.findByIdentity.mockResolvedValue(null);

      await expect(authService.loginAccount(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      authRepository.findByIdentity.mockResolvedValue(mockAccount);
      jest.spyOn(mockedBcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.loginAccount(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(authRedisRepository.setRefreshToken).not.toHaveBeenCalled();
    });
  });
  describe('loginAccount', () => {
    const loginDto: LoginDto = {
      identity: 'testuser',
      password: 'password123',
    };

    it('should validate credentials, save refresh token to redis and return tokens', async () => {
      authRepository.findByIdentity.mockResolvedValue(mockAccount);
      jest.spyOn(mockedBcrypt, 'compare').mockResolvedValue(true as never);

      jwtService.signAsync
        .mockResolvedValueOnce('access_token_123')
        .mockResolvedValueOnce('refresh_token_123');

      const result = await authService.loginAccount(loginDto);

      expect(authRepository.findByIdentity).toHaveBeenCalledWith(
        loginDto.identity,
      );

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockAccount.password,
      );

      expect(authRedisRepository.setRefreshToken).toHaveBeenCalledWith(
        mockAccount.id,
        'refresh_token_123',
        604800,
      );

      expect(result).toEqual({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      });
    });
    it('should throw UnauthorizedException if account is not found', async () => {
      authRepository.findByIdentity.mockResolvedValue(null);

      await expect(authService.loginAccount(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      authRepository.findByIdentity.mockResolvedValue(mockAccount);
      jest.spyOn(mockedBcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.loginAccount(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(authRedisRepository.setRefreshToken).not.toHaveBeenCalled();
    });
  });
  describe('refreshToken', () => {
    const refreshDto: RefreshTokenDto = {
      refreshToken: 'refresh_token_123',
    };

    it('should rotate tokens if refresh token is valid', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockAccount.id });
      authRedisRepository.getRefreshToken.mockResolvedValue(
        'refresh_token_123',
      );
      authRepository.findById.mockResolvedValue(mockAccount);

      jwtService.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      const result = await authService.refreshToken(refreshDto);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        refreshDto.refreshToken,
        { secret: 'refresh_secret' },
      );
      expect(authRedisRepository.setRefreshToken).toHaveBeenCalledWith(
        mockAccount.id,
        'new_refresh_token',
        604800,
      );
      expect(authRepository.findById).toHaveBeenCalledWith(mockAccount.id);

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });
    });
    it('should throw UnauthorizedException if account no longer exists', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockAccount.id });
      authRedisRepository.getRefreshToken.mockResolvedValue(
        'valid_refresh_token',
      );
      authRepository.findById.mockResolvedValue(null);

      await expect(authService.refreshToken(refreshDto)).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if jwt verification fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('JWT EXPIRED'));

      await expect(authService.refreshToken(refreshDto)).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      expect(authRedisRepository.getRefreshToken).not.toHaveBeenCalled();
    });
  });
  describe('logout', () => {
    it('should delete refresh token from redis and return success', async () => {
      authRedisRepository.deleteRefreshToken.mockResolvedValue(undefined);

      const result = await authService.logoutAccount(mockAccount.id);

      expect(authRedisRepository.deleteRefreshToken).toHaveBeenCalledWith(
        mockAccount.id,
      );

      expect(result).toEqual({
        success: true,
      });
    });
  });
});
