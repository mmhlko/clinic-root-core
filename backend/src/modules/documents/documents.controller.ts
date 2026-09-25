import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import {
  AuthGuard,
} from '@nestjs/passport';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UploadMedia } from '../media/decorators/upload-media.decorator.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';


@ApiBearerAuth('access-token')
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  /**
   * Публичный список активных документов
   */
  @Get()
  async findAll() {
    return this.documentsService.findAll();
  }

  /**
   * Список всех документов для админки
   */
  @Get('admin')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  async findAllAdmin() {
    return this.documentsService.findAllAdmin();
  }

  /**
   * Получить один документ
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ) {
    return this.documentsService.findById(id);
  }

  /**
   * Создать документ
   */
  @Post()
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UploadMedia('document')
  async create(
    @UploadedFile()
    file: Express.Multer.File,

    @Body()
    dto: CreateDocumentDto,
  ) {
    return this.documentsService.create(
      file,
      dto,
    );
  }

  /**
   * Обновить документ
   *
   * Файл необязательный.
   */
  @Patch(':id')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UploadMedia('document')
  async update(
    @Param('id') id: string,

    @Body()
    dto: UpdateDocumentDto,

    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    return this.documentsService.update(
      id,
      dto,
      file,
    );
  }

  /**
   * Удалить документ
   */
  @Delete(':id')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  async remove(
    @Param('id') id: string,
  ) {
    return this.documentsService.remove(id);
  }

  @Put(':id/active')
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @ApiBody({ schema: { type: 'object', properties: { isActive: { type: 'boolean', example: true } }, required: ['isActive'], example: { isActive: true } } })
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  async setActive(
    @Param('id') id: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    if (
      typeof isActive !== 'boolean'
    ) {
      throw new BadRequestException(
        'isActive must be boolean',
      );
    }

    return this.documentsService.setActive(
      id,
      isActive,
    );
  }
}