import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ServiceDirectionService } from './service-direction.service.js';
import { CreateServiceDirectionDto } from './dto/create-service-direction.dto.js';
import { UserRole } from '../../users/user-role.enum.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';


@ApiBearerAuth('access-token')
@Controller('service-directions')
export class ServiceDirectionController {
  constructor(
    private readonly serviceDirectionService: ServiceDirectionService,
  ) {}

  @Get()
  async findAll() {
    return this.serviceDirectionService.findAll(true);
  }

  @Get('admin')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllForAdmin() {
    return this.serviceDirectionService.findAll(false);
  }

  @Post()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(
    @Body() dto: CreateServiceDirectionDto,
  ) {
    return this.serviceDirectionService.create(dto);
  }
}