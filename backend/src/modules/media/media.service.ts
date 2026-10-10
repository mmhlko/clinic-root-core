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
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

import { Op, type FindOptions, type Transaction } from 'sequelize';

import {
  MediaModel,
  MediaStatus,
} from './media.model.js';
import { Cron } from '@nestjs/schedule';
import { ClinicTenantContextStore } from '../clinic/tenant/tenant-context.store.js';
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
    private readonly tenantContext: ClinicTenantContextStore,
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

  private getDirectory(type: MediaType, clinicSlug?: string) {
    const root = type === 'image' ? this.imagesDir : this.filesDir;
    if (!clinicSlug) return root;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clinicSlug)) {
      throw new BadRequestException('Invalid clinic slug for media path');
    }
    const directory = join(root, clinicSlug);
    this.ensureDirectory(directory);
    return directory;
  }

  private getUrlPrefix(type: MediaType, clinicSlug?: string) {
    const root = type === 'image' ? '/uploads/images' : '/uploads/files';
    return clinicSlug ? `${root}/${clinicSlug}` : root;
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

    const clinicSlug = this.tenantContext.require().clinicSlug;
    const directory = this.getDirectory(type, clinicSlug);

    const urlPrefix =
      this.getUrlPrefix(type, clinicSlug);

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

  async saveImportedImage(sourceUrl: string, transaction?: Transaction) {
    const context = this.tenantContext.require();
    const downloaded = await this.downloadPublicResource(sourceUrl, 'image');
    const extension = this.extensionForMime(downloaded.mimeType);
    const file = {
      fieldname: 'file',
      originalname: `imported${extension}`,
      encoding: '7bit',
      mimetype: downloaded.mimeType,
      size: downloaded.buffer.length,
      buffer: downloaded.buffer,
      destination: '',
      filename: '',
      path: '',
      stream: undefined as never,
    } satisfies Express.Multer.File;
    await validateMediaUploadContent(file, 'image');
    const directory = this.getDirectory('image', context.clinicSlug);
    const saved = this.saveFile(file, directory);
    const url = `${this.getUrlPrefix('image', context.clinicSlug)}/${saved.filename}`;
    try {
      const media = await this.mediaModel.create({
        clinicId: context.clinicId,
        filename: saved.filename,
        url,
        mimeType: saved.mimeType,
        size: saved.size,
        status: MediaStatus.ATTACHED,
      }, { transaction });
      return { id: media.id, url: media.url };
    } catch (error) {
      const filepath = join(directory, saved.filename);
      if (existsSync(filepath)) unlinkSync(filepath);
      throw error;
    }
  }

  async saveImportedDocument(sourceUrl: string, transaction?: Transaction) {
    const context = this.tenantContext.require();
    const downloaded = await this.downloadPublicResource(sourceUrl, 'document');
    const extension = this.extensionForMime(downloaded.mimeType);
    const file = {
      fieldname: 'file', originalname: `imported${extension}`, encoding: '7bit',
      mimetype: downloaded.mimeType, size: downloaded.buffer.length, buffer: downloaded.buffer,
      destination: '', filename: '', path: '', stream: undefined as never,
    } satisfies Express.Multer.File;
    await validateMediaUploadContent(file, 'document');
    const directory = this.getDirectory('document', context.clinicSlug);
    const saved = this.saveFile(file, directory);
    const url = `${this.getUrlPrefix('document', context.clinicSlug)}/${saved.filename}`;
    try {
      const media = await this.mediaModel.create({
        clinicId: context.clinicId, filename: saved.filename, url,
        mimeType: saved.mimeType, size: saved.size, status: MediaStatus.ATTACHED,
      }, { transaction });
      return { id: media.id, url: media.url, filename: saved.filename, fileType: extension.slice(1) };
    } catch (error) {
      const filepath = join(directory, saved.filename);
      if (existsSync(filepath)) unlinkSync(filepath);
      throw error;
    }
  }

  private extensionForMime(mimeType: string) {
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
      'application/pdf': '.pdf', 'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    };
    const extension = extensions[mimeType];
    if (!extension) throw new BadRequestException('Unsupported imported file type');
    return extension;
  }

  private async downloadPublicResource(source: string, type: MediaType) {
    let current = source;
    const allowedMimeTypes = type === 'image'
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    for (let redirect = 0; redirect <= 3; redirect += 1) {
      const url = this.assertPublicHttpsUrl(current);
      await this.assertPublicHost(url.hostname);
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(8_000),
        headers: { Accept: allowedMimeTypes.join(',') },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location || redirect === 3) throw new BadRequestException('Image URL redirected too many times');
        current = new URL(location, url).toString();
        continue;
      }
      if (!response.ok) throw new BadRequestException(`Image download failed (${response.status})`);
      const mimeType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
      if (!allowedMimeTypes.includes(mimeType ?? '')) {
        throw new BadRequestException(type === 'image'
          ? 'Imported image must be JPEG, PNG, or WebP'
          : 'Imported document must be PDF, DOC, or DOCX');
      }
      const declaredSize = Number(response.headers.get('content-length') ?? 0);
      if (declaredSize > maxSize) throw new BadRequestException(`Imported ${type} exceeds the size limit`);
      if (!response.body) throw new BadRequestException('Image response is empty');
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          size += value.byteLength;
          if (size > maxSize) {
            await reader.cancel();
            throw new BadRequestException(`Imported ${type} exceeds the size limit`);
          }
          chunks.push(value);
        }
      }
      return { buffer: Buffer.concat(chunks), mimeType: mimeType! };
    }
    throw new BadRequestException('Image download failed');
  }

  removeImportedFileAfterRollback(url: string) {
    const type = this.getMediaTypeFromUrl(url);
    const prefix = type === 'image' ? '/uploads/images/' : '/uploads/files/';
    const parts = url.startsWith(prefix) ? url.slice(prefix.length).split('/') : [];
    if (parts.length !== 2 || parts.some((part) => !part || part === '.' || part === '..')) return;
    const directory = this.getDirectory(type, parts[0]);
    const filename = basename(parts[1]);
    if (filename !== parts[1]) return;
    const filepath = join(directory, filename);
    if (existsSync(filepath)) unlinkSync(filepath);
  }

  private assertPublicHttpsUrl(value: string) {
    let url: URL;
    try { url = new URL(value); } catch { throw new BadRequestException('Invalid image URL'); }
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new BadRequestException('Imported image URL must use HTTPS');
    }
    return url;
  }

  private async assertPublicHost(hostname: string) {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
      throw new BadRequestException('Private image host is not allowed');
    }
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
    if (addresses.length === 0 || addresses.some(({ address }) => !this.isPublicIp(address))) {
      throw new BadRequestException('Private image host is not allowed');
    }
  }

  private isPublicIp(address: string) {
    if (isIP(address) === 4) {
      const [a, b] = address.split('.').map(Number);
      return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
        (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19)));
    }
    const normalized = address.toLowerCase();
    return normalized.startsWith('2') || normalized.startsWith('3');
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

    const urlPrefix = type === 'image' ? '/uploads/images/' : '/uploads/files/';
    const relativePath = media.url.startsWith(urlPrefix) ? media.url.slice(urlPrefix.length) : '';
    const parts = relativePath.split('/');
    if (parts.length > 2 || parts.some((part) => !part || part === '.' || part === '..')) {
      throw new BadRequestException('Invalid media URL');
    }
    const clinicSlug = parts.length === 2 ? parts[0] : undefined;
    const directory = this.getDirectory(type, clinicSlug);

    const safeFilename =
      basename(media.filename);

    if (
      safeFilename !== media.filename
    ) {
      throw new BadRequestException(
        'Invalid filename',
      );
    }
    if (parts.at(-1) !== safeFilename) {
      throw new BadRequestException('Media URL and filename do not match');
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
