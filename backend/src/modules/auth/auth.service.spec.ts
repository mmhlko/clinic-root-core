import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { UserRole } from '../users/user-role.enum.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findById: ReturnType<typeof vi.fn>;
    updateRefreshToken: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    usersService = {
      findById: vi.fn(),
      updateRefreshToken: vi.fn(),
    };
    jwtService = {
      signAsync: vi.fn().mockResolvedValue('short-lived-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: { get: vi.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the user for a valid refresh token without rotating it', async () => {
    const refreshToken = 'valid-refresh-token';
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 4);
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: UserRole.ADMIN,
      avatarUrl: null,
      isActive: true,
      hashedRefreshToken,
    });

    await expect(
      service.getSessionFromRefreshToken('user-1', refreshToken),
    ).resolves.toEqual({
      user: {
        id: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        role: UserRole.ADMIN,
        avatarUrl: null,
      },
      accessToken: 'short-lived-access-token',
    });
    expect(usersService.findById).toHaveBeenCalledWith('user-1');
    expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
    expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
  });

  it('rejects a refresh token that does not match the stored hash', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      isActive: true,
      hashedRefreshToken: await bcrypt.hash('different-token', 4),
    });

    await expect(
      service.getSessionFromRefreshToken('user-1', 'invalid-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects sessions for inactive users', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      isActive: false,
      hashedRefreshToken: await bcrypt.hash('valid-token', 4),
    });

    await expect(
      service.getSessionFromRefreshToken('user-1', 'valid-token'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
