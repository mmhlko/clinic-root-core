import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ClinicLocationService } from './clinic-location.service.js';

import { CreateClinicLocationDto } from './dto/create-clinic-location.dto.js';
import { UpdateClinicLocationDto } from './dto/update-clinic-location.dto.js';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';

@Controller('clinic/locations')
export class ClinicLocationController {
  constructor(
    private readonly clinicLocationService:
      ClinicLocationService,
  ) {}

  // Публичные активные филиалы
  @Get()
  async findAll() {
    return this.clinicLocationService.findAll(true);
  }

  // Все филиалы для админки
  @Get('admin')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async findAllAdmin() {
    return this.clinicLocationService.findAll(
      false,
    );
  }

  // Создание филиала
  @Post()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async create(
    @Body() dto: CreateClinicLocationDto,
  ) {
    return this.clinicLocationService.create(
      dto,
    );
  }

  // Обновление филиала
  @Patch(':id')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClinicLocationDto,
  ) {
    return this.clinicLocationService.update(
      id,
      dto,
    );
  }

  // Активация / деактивация филиала
  @Put(':id/active')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async setActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.clinicLocationService.setActive(
      id,
      isActive,
    );
  }

  // Один активный филиал для публичного сайта
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    const location =
      await this.clinicLocationService.findById(
        id,
      );

    if (!location.isActive) {
      throw new NotFoundException(
        'Clinic location not found',
      );
    }

    return location;
  }
}