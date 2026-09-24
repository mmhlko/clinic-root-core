import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { FaqService } from './faq.service.js';

import { SaveFaqDto } from './dto/save-faq.dto.js';


import { UserRole } from '../users/user-role.enum.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('faq')
export class FaqController {
  constructor(
    private readonly faqService: FaqService,
  ) {}

  @Get()
  async findAll() {
    return this.faqService.findAll(true);
  }

  @Get('admin')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllAdmin() {
    return this.faqService.findAll(false);
  }

  @Put()
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async saveAll(@Body() dto: SaveFaqDto) {
    return this.faqService.saveAll(dto);
  }
}