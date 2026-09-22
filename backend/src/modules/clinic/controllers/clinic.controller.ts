import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';


import { CreateClinicDto } from '../dto/create-clinic.dto.js';
import { UpdateClinicDto } from '../dto/update-clinic.dto.js';
import { ClinicService } from '../services/clinic.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../users/user-role.enum.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';



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

  // Все данные для админки
  @Get('admin')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
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
  @Roles(
    UserRole.ROOT,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async create(
    @Body() dto: CreateClinicDto,
  ) {
    return this.clinicService.create(dto);
  }

  // Изменение клиники
  @Patch()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
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