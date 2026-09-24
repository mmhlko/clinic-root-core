import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/auth.dto.js';
import { type Response } from 'express';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { UserRole } from '../users/user-role.enum.js';

interface RefreshRequest extends Request {
  user: {
    sub: string;
    refreshToken: string;
  };
}

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/auth', // only for refresh request
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax', // CSRF protection
  });
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {accessToken, refreshToken, user} = await this.authService.login(dto);
    setRefreshTokenCookie(res, refreshToken);
    return { accessToken, user };
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(
      req.user.sub,
      req.user.refreshToken,
    );

    setRefreshTokenCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-refresh'))
  async logout(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sub);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
    });

    return { message: 'Logged out' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() req: Request) {
    return req.user
  }
  
  @Roles(UserRole.ROOT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('root-test')
  rootTest(@Req() req: Request) {
    return {
      message: 'ROOT access granted',
      user: req.user,
    };
  }
}
