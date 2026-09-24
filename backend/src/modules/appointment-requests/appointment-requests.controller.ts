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

import { AppointmentRequestsService } from './appointment-requests.service.js';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto.js';
import { UpdateAppointmentRequestDto } from './dto/update-appointment-request.dto.js';


import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UpdateAppointmentRequestStatusDto } from './dto/update-appointment-request-status.dto.js';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('appointment-requests')
export class AppointmentRequestsController {
  constructor(
    private readonly appointmentRequestsService: AppointmentRequestsService,
  ) { }

  // Публичная форма на сайте
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 3,
      ttl: 1000 * 60 * 10, // 10 min
    },
  })
  async create(
    @Body() dto: CreateAppointmentRequestDto,
  ) {
    return this.appointmentRequestsService.create(dto);
  }

  // Список заявок для админки
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  async findAll() {
    return this.appointmentRequestsService.findAll();
  }

  // Одна заявка
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  async findById(
    @Param('id') id: string,
  ) {
    return this.appointmentRequestsService.findById(id);
  }

  // Изменение данных заявки
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentRequestDto,
  ) {
    return this.appointmentRequestsService.update(
      id,
      dto,
    );
  }

  // Удаление заявки
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  async remove(
    @Param('id') id: string,
  ) {
    return this.appointmentRequestsService.remove(id);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  async setStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentRequestStatusDto,
  ) {
    return this.appointmentRequestsService.setStatus(
      id,
      dto.status,
    );
  }
}