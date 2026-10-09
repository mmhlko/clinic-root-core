import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';


import { UpdateClinicDto } from '../dto/update-clinic.dto.js';
import { ClinicService } from '../services/clinic.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../users/user-role.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { SkipClinicTenantContext } from '../tenant/skip-clinic-tenant.decorator.js';
import { CreateTenantClinicDto } from '../dto/create-tenant-clinic.dto.js';
import { UpdatePlatformClinicDto } from '../dto/update-platform-clinic.dto.js';



@ApiBearerAuth('access-token')
@Controller('clinic')
export class ClinicController {
  constructor(
    private readonly clinicService:
      ClinicService,
  ) {}

  // Публичные данные клиники
  @Get()
  async findPublic() {
    return this.clinicService.findPublic();
  }

  @Get('root')
  @SkipClinicTenantContext()
  @Roles(UserRole.ROOT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllForPlatform() {
    return this.clinicService.findAllForPlatform();
  }

  @Patch('root/:id')
  @SkipClinicTenantContext()
  @Roles(UserRole.ROOT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async updateForPlatform(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformClinicDto,
  ) {
    return this.clinicService.updateForPlatform(id, dto);
  }

  // Все данные для админки
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
  async findAdmin() {
    return this.clinicService.findAdmin();
  }

  // Создание клиники
  @Post()
  @SkipClinicTenantContext()
  @Roles(
    UserRole.ROOT,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async create(
    @Body() dto: CreateTenantClinicDto,
  ) {
    return this.clinicService.createPlatformClinic(dto);
  }

  // Изменение клиники
  @Patch()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async update(
    @Body() dto: UpdateClinicDto,
  ) {
    return this.clinicService.update(dto);
  }
}
