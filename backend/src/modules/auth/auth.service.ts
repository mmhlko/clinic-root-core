import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/auth.dto.js';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UserRole } from '../users/user-role.enum.js';

@Injectable()
export class AuthService {
  private readonly jwtAccessSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtAccessExpire: StringValue;
  private readonly jwtRefreshExpire: StringValue;
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    this.jwtAccessSecret = configService.get<string>('JWT_ACCESS_SECRET') || '';
    this.jwtRefreshSecret =
      configService.get<string>('JWT_REFRESH_SECRET') || '';
    this.jwtAccessExpire =
      configService.get<StringValue>('JWT_ACCESS_EXPIRE') || '5m';
    this.jwtRefreshExpire =
      configService.get<StringValue>('JWT_REFRESH_EXPIRE') || '7d';
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('User not found or incorrect password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User account is innactive');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async getSessionFromRefreshToken(userId: string, refreshToken: string) {
    const user = await this.getUserFromValidRefreshToken(userId, refreshToken);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.getUserFromValidRefreshToken(userId, refreshToken);

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
    );

    await this.updateRefreshToken(
      user.id,
      tokens.refreshToken,
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(
      userId,
      null,
    );
  }

  private async getUserFromValidRefreshToken(
    userId: string,
    refreshToken: string,
  ) {
    const user = await this.usersService.findById(userId);

    if (!user.isActive) {
      throw new ForbiddenException('User account is inactive');
    }

    if (
      !user.hashedRefreshToken ||
      !(await bcrypt.compare(refreshToken, user.hashedRefreshToken))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ) {
    if (!refreshToken) {
      return this.usersService.updateRefreshToken(userId, null);
    }
    const hash = await bcrypt.hash(refreshToken, 10);

    return this.usersService.updateRefreshToken(userId, hash);
  }

  private async getTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        payload,
        {
          secret: this.jwtAccessSecret,
          expiresIn: this.jwtAccessExpire,
        },
      ),
      this.jwtService.signAsync(
        payload,
        { secret: this.jwtRefreshSecret, expiresIn: this.jwtRefreshExpire },
      ),
    ]);
    return { accessToken, refreshToken };
  }
}
