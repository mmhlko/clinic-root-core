import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';

import { DashboardService } from './dashboard.service.js';
import { DashboardResponseDto } from './dashboard.dto.js';

@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(
  UserRole.ROOT,
  UserRole.ADMIN,
  UserRole.MANAGER,
)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Сводные данные административной панели' })
  @ApiOkResponse({ type: DashboardResponseDto })
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }
}