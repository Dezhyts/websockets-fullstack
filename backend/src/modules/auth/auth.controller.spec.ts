import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    registerAccount: jest.fn(),
    loginAccount: jest.fn(),
    refreshToken: jest.fn(),
    logoutAccount: jest.fn(),
  };

  const configValues: Record<string, unknown> = {
    NODE_ENV: 'development',
    JWT_REFRESH_EXPIRES_IN: 604800000,
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => configValues[key]),
  };

  const mockResponse = () => {
    const res = {} as Response;
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (refreshToken?: string) => {
    return {
      cookies: refreshToken ? { refreshToken } : {},
    } as Request;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user and set refresh token cookie', async () => {
      const res = mockResponse();

      const registerResponse = {
        accessToken: 'accessToken_123',
        refreshToken: 'refreshToken_123',
      };

      mockAuthService.registerAccount.mockResolvedValue(registerResponse);

      const result = await controller.register(registerDto, res);

      expect(mockAuthService.registerAccount).toHaveBeenCalledWith(registerDto);

      expect(jest.mocked(res.cookie)).toHaveBeenCalledWith(
        'refreshToken',
        registerResponse.refreshToken,
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 604800000,
        },
      );
      expect(result).toEqual(registerResponse);
    });

    it('should throw an error if register fails', async () => {
      const res = mockResponse();
      const mockError = new Error('Invalid credentials');

      mockAuthService.registerAccount.mockRejectedValue(mockError);

      await expect(controller.register(registerDto, res)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      identity: 'test@example.com',
      password: 'password123',
    };

    it('should login user and set refresh token cookie', async () => {
      const res = mockResponse();

      const loginResponse = {
        accessToken: 'accessToken_123',
        refreshToken: 'refreshToken_123',
      };

      mockAuthService.loginAccount.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto, res);

      expect(mockAuthService.loginAccount).toHaveBeenCalledWith(loginDto);

      expect(jest.mocked(res.cookie)).toHaveBeenCalledWith(
        'refreshToken',
        loginResponse.refreshToken,
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 604800000,
        },
      );
      expect(result).toEqual(loginResponse);
    });

    it('should throw an error if login fails', async () => {
      const res = mockResponse();
      const mockError = new Error('Invalid credentials');

      mockAuthService.loginAccount.mockRejectedValue(mockError);

      await expect(controller.login(loginDto, res)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const refreshDto: RefreshTokenDto = {
      refreshToken: 'refreshToken_123',
    };

    it('should refresh tokens and set new refresh token cookie', async () => {
      const req = mockRequest(refreshDto.refreshToken);
      const res = mockResponse();

      const refreshResponse = {
        accessToken: 'new_accessToken_123',
        refreshToken: 'new_refresh_token_789',
      };

      mockAuthService.refreshToken.mockResolvedValue(refreshResponse);

      const result = await controller.refresh(req, res);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshDto);

      expect(jest.mocked(res.cookie)).toHaveBeenCalledWith(
        'refreshToken',
        refreshResponse.refreshToken,
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 604800000,
        },
      );
      expect(result).toEqual({ accessToken: refreshResponse.accessToken });
    });

    it('should throw UnauthorizedException if refresh token is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await expect(controller.refresh(req, res)).rejects.toThrow(
        'Refresh token not found in cookies',
      );

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user and clear refresh token cookie', () => {
      const res = mockResponse();
      const userId = 'user_123';

      mockAuthService.logoutAccount.mockReturnValue(true);

      const result = controller.logout(userId, res);

      expect(mockAuthService.logoutAccount).toHaveBeenCalledWith(userId);

      expect(jest.mocked(res.clearCookie)).toHaveBeenCalledWith(
        'refreshToken',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        },
      );

      expect(result).toEqual({ success: true });
    });

    it('should still clear the cookie even if logoutAccount returns false', () => {
      const res = mockResponse();
      const userId = 'user_456';

      mockAuthService.logoutAccount.mockReturnValue(false);

      const result = controller.logout(userId, res);

      expect(jest.mocked(res.clearCookie)).toHaveBeenCalledWith(
        'refreshToken',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        },
      );

      expect(result).toEqual({ success: false });
    });
  });
});
