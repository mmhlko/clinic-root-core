import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';


import { CreateClinicSocialLinkDto } from '../dto/create-clinic-social-link.dto.js';
import { UpdateClinicSocialLinkDto } from '../dto/update-clinic-social-link.dto.js';

import { Roles } from '../../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { UserRole } from '../../users/user-role.enum.js';
import { SaveClinicSocialLinksDto } from '../dto/save-clinic-social-links.dto.js';
import { ClinicSocialLinkService } from '../services/clinic-social-link.service.js';

@Controller('clinic/social-links')
export class ClinicSocialLinkController {
  constructor(
    private readonly clinicSocialLinkService:
      ClinicSocialLinkService,
  ) { }

  // Публичные соцсети
  @Get()
  async findAll() {
    return this.clinicSocialLinkService.findAll(
      true,
    );
  }

  // Все соцсети для админки
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
    return this.clinicSocialLinkService.findAll(
      false,
    );
  }

  @Post()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async create(
    @Body() dto: CreateClinicSocialLinkDto,
  ) {
    return this.clinicSocialLinkService.create(
      dto,
    );
  }

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
    @Body() dto: SaveClinicSocialLinksDto,
  ) {
    return this.clinicSocialLinkService.saveAll(
      dto,
    );
  }

  @Patch(':id')
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
    @Param('id') id: string,
    @Body() dto: UpdateClinicSocialLinkDto,
  ) {
    return this.clinicSocialLinkService.update(
      id,
      dto,
    );
  }

  @Put(':id/active')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async setActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.clinicSocialLinkService.setActive(
      id,
      isActive,
    );
  }

  @Delete(':id')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async remove(
    @Param('id') id: string,
  ) {
    return this.clinicSocialLinkService.remove(
      id,
    );
  }
}