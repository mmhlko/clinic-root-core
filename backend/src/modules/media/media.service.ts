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

import {
  basename,
  extname,
  join,
} from 'path';

import { randomUUID } from 'crypto';

type MediaType = 'image' | 'document';

@Injectable()
export class MediaService {
  private readonly imagesDir = join(
    process.cwd(),
    'uploads',
    'images',
  );

  private readonly filesDir = join(
    process.cwd(),
    'uploads',
    'files',
  );

  constructor() {
    this.ensureDirectory(this.imagesDir);
    this.ensureDirectory(this.filesDir);
  }

  private ensureDirectory(directory: string) {
    if (!existsSync(directory)) {
      mkdirSync(directory, {
        recursive: true,
      });
    }
  }

  private generateFilename(
    originalName: string,
  ): string {
    const date = new Date();

    const timestamp =
      date
        .toISOString()
        .replace(/\D/g, '')
        .slice(0, 14);

    const random =
      randomUUID().split('-')[0];

    const extension =
      extname(originalName).toLowerCase();

    return `${timestamp}-${random}${extension}`;
  }

  private saveFile(
    file: Express.Multer.File,
    directory: string,
  ) {
    const filename =
      this.generateFilename(
        file.originalname,
      );

    const filepath = join(
      directory,
      filename,
    );

    writeFileSync(
      filepath,
      file.buffer,
    );

    return {
      filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async save(
    file: Express.Multer.File,
    type: MediaType,
  ) {
    if (!file) {
      throw new BadRequestException(
        'File is required',
      );
    }

    const directory =
      type === 'image'
        ? this.imagesDir
        : this.filesDir;

    const urlPrefix =
      type === 'image'
        ? '/uploads/images'
        : '/uploads/files';

    const savedFile =
      this.saveFile(
        file,
        directory,
      );

    const fileType =
      extname(file.originalname)
        .replace('.', '')
        .toLowerCase();

    return {
      ...savedFile,
      fileType,
      url: `${urlPrefix}/${savedFile.filename}`,
    };
  }

  async uploadImage(
    file: Express.Multer.File,
  ) {
    return this.save(file, 'image');
  }

  async uploadFile(
    file: Express.Multer.File,
  ) {
    return this.save(file, 'document');
  }

  async removeImage(
    filename: string,
  ) {
    const safeFilename =
      basename(filename);

    if (
      safeFilename !== filename
    ) {
      throw new BadRequestException(
        'Invalid filename',
      );
    }

    const filepath = join(
      this.imagesDir,
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

  async removeFile(
    filename: string,
  ) {
    const safeFilename =
      basename(filename);

    if (
      safeFilename !== filename
    ) {
      throw new BadRequestException(
        'Invalid filename',
      );
    }

    const filepath = join(
      this.filesDir,
      safeFilename,
    );

    if (!existsSync(filepath)) {
      throw new NotFoundException(
        'File not found',
      );
    }

    unlinkSync(filepath);

    return {
      message: 'File deleted',
    };
  }
}