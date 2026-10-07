import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ServiceDirectionService } from './service-direction.service.js';
import { CreateServiceDirectionDto } from './dto/create-service-direction.dto.js';
import { UpdateServiceDirectionDto } from './dto/update-service-direction.dto.js';
import { UserRole } from '../../users/user-role.enum.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { ReorderDto } from '../../../shared/dto/reorder.dto.js';


@ApiBearerAuth('access-token')
@Controller('service-directions')
export class ServiceDirectionController {
  constructor(
    private readonly serviceDirectionService: ServiceDirectionService,
  ) { }

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

  @Patch(':id')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDirectionDto,
  ) {
    return this.serviceDirectionService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ROOT, UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async remove(@Param('id') id: string) {
    return this.serviceDirectionService.remove(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Изменить порядок отображения' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async reorder(
    @Body() dto: ReorderDto
  ) {
    return this.serviceDirectionService.reorderServiceDirections(dto.ids)
  }
}