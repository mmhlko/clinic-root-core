import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Delete,
  Param,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import { AuthGuard } from '@nestjs/passport';

import { MediaService } from './media.service.js';

import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/user-role.enum.js';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService:
      MediaService,
  ) { }

  @Post('images')
  @Roles(
    UserRole.ROOT,
    UserRole.ADMIN,
    UserRole.MANAGER,
  )
  @UseGuards(
    AuthGuard('jwt'),
    RolesGuard,
  )
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),

          new FileTypeValidator({
            fileType:
              /(jpg|jpeg|png|webp)$/i,
          }),
        ],
      }),
    )
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
}