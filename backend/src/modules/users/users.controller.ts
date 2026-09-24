import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service.js';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto.js';
import { UserRole } from './user-role.enum.js';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
}

interface AuthRequest extends Request {
  user: AuthUser;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Post()
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreateUserDto,
  ) {
    const currentUser = req.user;

    if (currentUser.role === UserRole.ROOT) {
      if (
        dto.role !== UserRole.ADMIN &&
        dto.role !== UserRole.MANAGER
      ) {
        throw new ForbiddenException(
          'Root can create only admin or manager',
        );
      }
    }

    if (currentUser.role === UserRole.ADMIN) {
      if (dto.role !== UserRole.MANAGER) {
        throw new ForbiddenException(
          'Admin can create only manager',
        );
      }
    }

    return this.usersService.create(dto);
  }

  @Get()
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const currentUser = req.user;
    const targetUser = await this.usersService.findById(id);

    // ROOT может редактировать любого
    if (currentUser.role === UserRole.ROOT) {
      return this.usersService.update(id, dto);
    }

    if (currentUser.role === UserRole.ADMIN) {
      // ADMIN может редактировать себя
      if (targetUser.id === currentUser.sub) {
        if (dto.role !== undefined) {
          throw new ForbiddenException(
            'Admin cannot change their own role',
          );
        }

        return this.usersService.update(id, dto);
      }

      // ADMIN может редактировать MANAGER
      if (targetUser.role === UserRole.MANAGER) {
        if (dto.role !== undefined) {
          throw new ForbiddenException(
            'Admin cannot change user role',
          );
        }

        return this.usersService.update(id, dto);
      }

      // Других ADMIN и ROOT редактировать нельзя
      throw new ForbiddenException(
        'Admin can edit only themselves or managers',
      );
    }

    throw new ForbiddenException(
      'You do not have permission to edit users',
    );
  }

  @Put(':id/active')
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async setActive(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    const currentUser = req.user;
    const targetUser = await this.usersService.findById(id);

    if (currentUser.sub === targetUser.id) {
      throw new ForbiddenException(
        'User can not change activity on yourself',
      );
    }

    // ROOT может активировать/деактивировать любого
    if (currentUser.role === UserRole.ROOT) {      
      return this.usersService.setActive(id, isActive);
    }

    // ADMIN может управлять собой и менеджерами
    if (currentUser.role === UserRole.ADMIN) {
      if (targetUser.role !== UserRole.MANAGER) {
        throw new ForbiddenException(
          'Admin can manage only managers',
        );
      }
      return this.usersService.setActive(id, isActive);
    }

    throw new ForbiddenException(
      'You do not have permission to change user status',
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(
    @Req() req: AuthRequest,
  ) {
    const currentUser = req.user;   
    return this.usersService.findUserById(currentUser.sub)
  }

  @Get(':id')
  @Roles(UserRole.ROOT, UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }
}