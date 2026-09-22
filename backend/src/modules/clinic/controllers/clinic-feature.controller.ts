import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';


import { SaveClinicFeaturesDto } from '../dto/save-clinic-features.dto.js';

import { Roles } from '../../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { UserRole } from '../../users/user-role.enum.js';
import { ClinicFeatureService } from '../services/clinic-feature.service.js';

@Controller('clinic/features')
export class ClinicFeatureController {
  constructor(
    private readonly clinicFeatureService:
      ClinicFeatureService,
  ) {}

  // Публичные активные преимущества
  @Get()
  async findAll() {
    return this.clinicFeatureService.findAll(
      true,
    );
  }

  // Все преимущества для админки
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
    return this.clinicFeatureService.findAll(
      false,
    );
  }

  // Полное сохранение списка
  @Put()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async saveAll(
    @Body() dto: SaveClinicFeaturesDto,
  ) {
    return this.clinicFeatureService.saveAll(
      dto,
    );
  }
}