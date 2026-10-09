import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

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

import { Op, type FindOptions, type Transaction } from 'sequelize';

import {
  MediaModel,
  MediaStatus,
} from './media.model.js';
import { Cron } from '@nestjs/schedule';
import {
  validateMediaUploadContent,
  type MediaUploadType,
} from './media-upload.validation.js';

type MediaType = MediaUploadType;

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name)

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

  constructor(
    @InjectModel(MediaModel)
    private readonly mediaModel: typeof MediaModel,
  ) {
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

  private getDirectory(
    type: MediaType,
  ) {
    return type === 'image'
      ? this.imagesDir
      : this.filesDir;
  }

  private getUrlPrefix(
    type: MediaType,
  ) {
    return type === 'image'
      ? '/uploads/images'
      : '/uploads/files';
  }

  private getMediaTypeFromUrl(
    url: string,
  ): MediaType {
    if (
      url.startsWith('/uploads/images/')
    ) {
      return 'image';
    }

    if (
      url.startsWith('/uploads/files/')
    ) {
      return 'document';
    }

    throw new BadRequestException(
      'Invalid media URL',
    );
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

    await validateMediaUploadContent(file, type);

    const directory =
      this.getDirectory(type);

    const urlPrefix =
      this.getUrlPrefix(type);

    const savedFile =
      this.saveFile(
        file,
        directory,
      );

    const fileType =
      extname(file.originalname)
        .replace('.', '')
        .toLowerCase();

    const url =
      `${urlPrefix}/${savedFile.filename}`;

    try {
      const media =
        await this.mediaModel.create({
          filename: savedFile.filename,
          url,
          mimeType: savedFile.mimeType,
          size: savedFile.size,
          status: MediaStatus.TEMPORARY,
        });

      return {
        id: media.id,
        filename: savedFile.filename,
        originalName: savedFile.originalName,
        size: savedFile.size,
        mimeType: savedFile.mimeType,
        fileType,
        url,
        status: media.status,
      };
    } catch (error) {
      /*
       * Media не создалась в БД.
       * Удаляем уже записанный физический файл,
       * чтобы не оставить orphan-файл.
       */
      const filepath =
        join(
          directory,
          savedFile.filename,
        );

      if (existsSync(filepath)) {
        unlinkSync(filepath);
      }

      throw error;
    }
  }

  async uploadImage(
    file: Express.Multer.File,
  ) {
    return this.save(
      file,
      'image',
    );
  }

  async uploadFile(
    file: Express.Multer.File,
  ) {
    return this.save(
      file,
      'document',
    );
  }

  async findById(
    id: string,
    transaction?: Transaction,
  ) {
    const media =
      await this.mediaModel.findByPk(
        id,
        {
          transaction,
        },
      );

    if (!media) {
      throw new NotFoundException(
        'Media not found',
      );
    }

    return media;
  }

  async findTemporaryById(
    id: string,
    transaction?: Transaction,
  ) {
    const media =
      await this.mediaModel.findOne({
        where: {
          id,
          status: MediaStatus.TEMPORARY,
        },
        transaction,
      });

    if (!media) {
      throw new NotFoundException(
        'Temporary media not found',
      );
    }

    return media;
  }

  async isAllowedPublicUpload(filename: string): Promise<boolean> {
    const safeFilename = basename(filename);

    if (safeFilename !== filename) {
      return false;
    }

    const publicUploadOptions: FindOptions<MediaModel> & { hooks: false } = {
      where: {
        filename: safeFilename,
        // status: MediaStatus.ATTACHED,
      },
      hooks: false,
    };
    const media = await this.mediaModel.findOne(publicUploadOptions);

    return Boolean(media);
  }

  async attach(
    id: string,
    transaction?: Transaction,
  ) {
    const media =
      await this.findTemporaryById(
        id,
        transaction,
      );

    media.status =
      MediaStatus.ATTACHED;

    await media.save({
      transaction,
    });

    return media;
  }

  async replaceImage(
    previousMediaId: string | null,
    nextMediaId: string | null,
    transaction: Transaction,
  ): Promise<MediaModel | null> {
    const sameMediaId = previousMediaId === nextMediaId;
    const previousMedia = previousMediaId && !sameMediaId
      ? await this.findImageByMediaId(previousMediaId, transaction)
      : null;

    if (nextMediaId && /^[0-9a-f-]{36}$/i.test(nextMediaId)) {
      const nextMedia = await this.mediaModel.findByPk(nextMediaId, {
        transaction,
      });
      if (!nextMedia) {
        throw new NotFoundException('Temporary image not found');
      }
      await this.attachImageMedia(nextMedia, sameMediaId, transaction);
    }

    return previousMedia;
  }

  private async attachImageMedia(
    media: MediaModel,
    sameMediaId: boolean,
    transaction: Transaction,
  ): Promise<void> {
    if (media.status === MediaStatus.ATTACHED) {
      if (!sameMediaId) {
        throw new BadRequestException('Image is already attached');
      }
      return;
    }

    media.status = MediaStatus.ATTACHED;
    await media.save({ transaction });
  }

  private findImageByMediaId(
    mediaid: string,
    transaction?: Transaction,
  ) {
    if (mediaid.startsWith('/uploads/images/')) {
      return this.mediaModel.findOne({
        where: { url: mediaid },
        transaction,
      });
    }

    if (/^[0-9a-f-]{36}$/i.test(mediaid)) {
      return this.mediaModel.findByPk(mediaid, { transaction });
    }

    return Promise.resolve(null);
  }

  async delete(
    media: MediaModel,
    skipTenantScope = false,
  ) {
    const type =
      this.getMediaTypeFromUrl(
        media.url,
      );

    const directory =
      this.getDirectory(type);

    const safeFilename =
      basename(media.filename);

    if (
      safeFilename !== media.filename
    ) {
      throw new BadRequestException(
        'Invalid filename',
      );
    }

    const filepath =
      join(
        directory,
        safeFilename,
      );

    /*
     * Физический файл мог быть уже удалён.
     * В таком случае всё равно удаляем
     * запись Media из БД.
     */
    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }

    await media.destroy({ hooks: !skipTenantScope });
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

    const media = await this.mediaModel.findOne({
      where: { filename: safeFilename, url: { [Op.like]: '/uploads/images/%' } },
    });
    if (!media) throw new NotFoundException('Image not found');
    await this.delete(media);
    return { message: 'Image deleted' };
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

    const media = await this.mediaModel.findOne({
      where: { filename: safeFilename, url: { [Op.like]: '/uploads/files/%' } },
    });
    if (!media) throw new NotFoundException('File not found');
    await this.delete(media);
    return { message: 'File deleted' };
  }

  async deleteTemporary(id: string) {
    const media =
      await this.findTemporaryById(id);

    await this.delete(media);

    return {
      message: 'Media deleted',
    };
  }

  @Cron('0 * * * *')
  async cleanupTemporaryMedia(): Promise<void> {
    this.logger.log("Start cleanupTemporaryMedia")
    const ttlHours = 24;

    if (!Number.isFinite(ttlHours) || ttlHours <= 0) {
      this.logger.error(
        `Invalid MEDIA_TEMPORARY_TTL_HOURS: ${process.env.MEDIA_TEMPORARY_TTL_HOURS}`,
      );
      return;
    }

    const cutoff = new Date(
      Date.now() - ttlHours * 60 * 60 * 1000,
    );

    const cleanupOptions: FindOptions<MediaModel> & { hooks: false } = {
      where: {
        status: MediaStatus.TEMPORARY,
        createdAt: {
          [Op.lt]: cutoff,
        },
      },
      hooks: false,
    };
    const temporaryMedia = await this.mediaModel.findAll(cleanupOptions);

    if (temporaryMedia.length === 0) {
      return;
    }

    this.logger.log(
      `Found ${temporaryMedia.length} temporary media file(s) for cleanup`,
    );

    for (const media of temporaryMedia) {
      try {
        await this.delete(media, true);

        this.logger.log(
          `Deleted temporary media: ${media.id} (${media.filename})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete temporary media ${media.id} (${media.filename})`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
