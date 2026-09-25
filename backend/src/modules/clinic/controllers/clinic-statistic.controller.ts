import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ClinicStatisticService } from '../services/clinic-statistic.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../users/user-role.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { SaveClinicStatisticsDto } from '../dto/save-clinic-statistics.dto.js';


@ApiBearerAuth('access-token')
@Controller('clinic/statistics')
export class ClinicStatisticController {
  constructor(
    private readonly clinicStatisticService:
      ClinicStatisticService,
  ) {}

  // Активная статистика для сайта
  @Get()
  async findAll() {
    return this.clinicStatisticService.findAll(
      true,
    );
  }

  // Вся статистика для админки
  @Get('admin')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async findAllAdmin() {
    return this.clinicStatisticService.findAll(
      false,
    );
  }

  // Полное сохранение списка
  @Put()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async saveAll(
    @Body() dto: SaveClinicStatisticsDto,
  ) {
    return this.clinicStatisticService.saveAll(
      dto,
    );
  }
}