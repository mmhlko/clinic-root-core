import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

import { DoctorsService } from './doctors.service.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';

@ApiTags('Doctors')
@ApiBearerAuth('access-token')
@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Получить список активных врачей' })
  async findAll() {
    const onlyActive = true;
    return this.doctorsService.findAll(onlyActive);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Получить список врачей для админки' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllAdmin() {
    return this.doctorsService.findAll(false);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить публичную карточку врача' })
  async findOnePublic(
    @Param('id') id: string,
  ) {
    return this.doctorsService.findById({
      id,
      onlyActive: true,
    });
  }

  @Get(':id/admin')
  @ApiOperation({ summary: 'Получить карточку врача для админки' })
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



  @Post()
  @ApiOperation({ summary: 'Создать врача' })
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
  @ApiOperation({ summary: 'Обновить врача' })
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
  @ApiOperation({ summary: 'Изменить активность врача' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean', example: true } }, required: ['isActive'], example: { isActive: true } } })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async setActive(
    @Param('id') id: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.doctorsService.setActive(
      id,
      isActive,
    );
  }
}