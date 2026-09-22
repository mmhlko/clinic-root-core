import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';

import { basename, extname, join } from 'path';

import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  private readonly uploadDir = join(
    process.cwd(),
    'uploads',
    'images',
  );

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, {
        recursive: true,
      });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Image file is required',
      );
    }

    const extension =
      extname(file.originalname).toLowerCase();

    const filename =
      `${randomUUID()}${extension}`;

    const filepath = join(
      this.uploadDir,
      filename,
    );

    writeFileSync(
      filepath,
      file.buffer,
    );

    return {
      filename,
      url: `/uploads/images/${filename}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async removeImage(filename: string) {
    const safeFilename = basename(filename);

    if (safeFilename !== filename) {
      throw new BadRequestException(
        'Invalid filename',
      );
    }

    const filepath = join(
      this.uploadDir,
      safeFilename,
    );

    if (!existsSync(filepath)) {
      throw new NotFoundException(
        'Image not found',
      );
    }

    unlinkSync(filepath);

    return {
      message: 'Image deleted',
    };
  }
}