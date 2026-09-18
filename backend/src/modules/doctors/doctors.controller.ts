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

import { DoctorsService } from './doctors.service.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
  ) { }

  @Get()
  async findAll() {
    const onlyActive = true;
    return this.doctorsService.findAll(onlyActive);
  }

  @Get(':id')
  async findOnePublic(
    @Param('id') id: string,
  ) {
    return this.doctorsService.findById({
      id,
      onlyActive: true,
    });
  }

  @Get(':id/admin')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findOneAdmin(
    @Param('id') id: string,
  ) {
    return this.doctorsService.findById({
      id,
      onlyActive: false,
    });
  }

  @Get('admin')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllAdmin() {
    const onlyActive = false;
    return this.doctorsService.findAll(onlyActive);
  }

  @Post()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(dto);
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
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorsService.update(id, dto);
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
    return this.doctorsService.setActive(
      id,
      isActive,
    );
  }
}