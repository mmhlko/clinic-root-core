import {
  Body,
  Controller,
  Delete,
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

import { ReviewsService } from './reviews.service.js';

import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  // Публичное создание отзыва
  // Новый отзыв автоматически получает status = pending
  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  async create(
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(dto);
  }

  // Публичные опубликованные отзывы
  @Get()
  @ApiOperation({ summary: 'Получить опубликованные отзывы' })
  async findAll() {
    return this.reviewsService.findAll(true);
  }

  // Все отзывы для админки
  @Get('admin')
  @ApiOperation({ summary: 'Получить все отзывы для админки' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async findAllAdmin() {
    return this.reviewsService.findAll(false);
  }

  // Новые отзывы, ожидающие модерации
  @Get('admin/pending')
  @ApiOperation({ summary: 'Получить отзывы в ожидании модерации' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async findPending() {
    return this.reviewsService.findPending();
  }

  // Изменение отзыва из админки
  @Patch(':id')
  @ApiOperation({ summary: 'Изменить отзыв' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(
      id,
      dto,
    );
  }

  // Опубликовать отзыв
  @Put(':id/publish')
  @ApiOperation({ summary: 'Опубликовать отзыв' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async publish(
    @Param('id') id: string,
  ) {
    return this.reviewsService.publish(id);
  }

  // Отклонить отзыв
  @Put(':id/reject')
  @ApiOperation({ summary: 'Отклонить отзыв' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async reject(
    @Param('id') id: string,
  ) {
    return this.reviewsService.reject(id);
  }

  // Скрыть / показать уже опубликованный отзыв
  @Put(':id/active')
  @ApiOperation({ summary: 'Изменить активность отзыва' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean', example: true } }, required: ['isActive'], example: { isActive: true } } })
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async setActive(
    @Param('id') id: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.reviewsService.setActive(
      id,
      isActive,
    );
  }

  // Один опубликованный отзыв для публичного сайта
  @Get(':id')
  @ApiOperation({ summary: 'Получить отзыв по ID' })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.reviewsService.findById({
      id,
      onlyActive: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить отзыв' })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async remove(
    @Param('id') id: string,
  ) {
    return this.reviewsService.remove(id);
  }
}