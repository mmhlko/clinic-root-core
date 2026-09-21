import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ServicesService } from './services.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
  ) { }

  @Post()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(
    @Body() dto: CreateServiceDto,
  ) {
    return this.servicesService.create(dto);
  }

  @Get()
  async findAll() {
    return this.servicesService.findAll(true);
  }

  @Get('admin')
  @Roles(UserRole.ROOT, UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllAdmin() {
    return this.servicesService.findAll(false);
  }

  @Patch(':id')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, dto);
  }

  @Put(':id/active')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async setActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.servicesService.setActive(
      id,
      isActive,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    return this.servicesService.findById({
      id,
      onlyActive: true,
    });
  }
}