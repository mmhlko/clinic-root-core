import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { WorksService } from './works.service.js';

import { CreateWorkDto } from './dto/create-work.dto.js';
import { UpdateWorkDto } from './dto/update-work.dto.js';

import { UserRole } from '../users/user-role.enum.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@ApiBearerAuth('access-token')
@Controller('works')
export class WorksController {
  constructor(
    private readonly worksService: WorksService,
  ) {}

  // Публичные работы
  @Get()
  async findAll() {
    return this.worksService.findAll(true);
  }

  // Все работы для админ-панели
  @Get('admin')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllAdmin() {
    return this.worksService.findAll(false);
  }

  // Получить одну работу
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.worksService.findById(id);
  }

  // Создать работу
  @Post()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(
    @Body() dto: CreateWorkDto,
  ) {
    return this.worksService.create(dto);
  }

  // Редактировать
  @Patch(':id')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkDto,
  ) {
    return this.worksService.update(id, dto);
  }

  // Активировать / деактивировать
  @Put(':id/active')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean', example: true } }, required: ['isActive'], example: { isActive: true } } })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async setActive(
    @Param('id') id: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.worksService.setActive(
      id,
      isActive,
    );
  }

  // Полностью удалить
  @Delete(':id')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async remove(
    @Param('id') id: string,
  ) {
    return this.worksService.remove(id);
  }
}