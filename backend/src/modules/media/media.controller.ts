import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

import { MediaService } from './media.service.js';
import { UploadMedia } from './decorators/upload-media.decorator.js';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';

@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
  ) { }

  @Post('images')
  @UploadMedia('image')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async uploadImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.mediaService.uploadImage(
      file,
    );
  }

  @Delete('images/:filename')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  async removeImage(
    @Param('filename') filename: string,
  ) {
    return this.mediaService.removeImage(
      filename,
    );
  }

  @Delete(':id')
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
    return this.mediaService.deleteTemporary(
      id,
    );
  }
}