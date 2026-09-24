import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/sequelize';

import {
  Sequelize,
} from 'sequelize-typescript';
import { DocumentModel } from './document.model.js';
import { MediaService } from '../media/media.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';


@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentModel)
    private readonly documentModel: typeof DocumentModel,

    private readonly mediaService: MediaService,

    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Публичный список активных документов
   */
  async findAll() {
    return this.documentModel.findAll({
      where: {
        isActive: true,
      },
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
  }

  /**
   * Список всех документов для админки
   */
  async findAllAdmin() {
    return this.documentModel.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
  }

  /**
   * Получить один документ
   */
  async findById(id: string) {
    const document =
      await this.documentModel.findOne({
        where: {
          id,
          isActive: true,
        },
      });

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    return document;
  }

  /**
   * Создать один документ
   */
  async create(
    file: Express.Multer.File,
    dto: CreateDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Document file is required',
      );
    }

    const savedFile =
      await this.mediaService.save(
        file,
        'document',
      );

    const transaction =
      await this.sequelize.transaction();

    try {
      const document =
        await this.documentModel.create(
          {
            title: dto.title,
            description:
              dto.description ?? null,
            fileUrl: savedFile.url,
            fileName:
              savedFile.originalName,
            fileType:
              savedFile.fileType,
            sortOrder:
              dto.sortOrder ?? 0,
            isActive: true,
          },
          {
            transaction,
          },
        );

      await transaction.commit();

      return document;
    } catch (error) {
      await transaction.rollback();

      try {
        await this.mediaService.removeFile(
          savedFile.filename,
        );
      } catch {
        // Игнорируем ошибку очистки файла
      }

      throw error;
    }
  }

  /**
   * Обновить документ.
   *
   * Если новый файл не передан —
   * меняем только данные документа.
   *
   * Если новый файл передан —
   * сохраняем новый, обновляем БД,
   * после успешного commit удаляем старый.
   */
  async update(
    id: string,
    dto: UpdateDocumentDto,
    file?: Express.Multer.File,
  ) {
    const document =
      await this.documentModel.findByPk(id);

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    // Если файл не меняется,
    // просто обновляем данные.
    if (!file) {
      await document.update({
        ...(dto.title !== undefined && {
          title: dto.title,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.sortOrder !== undefined && {
          sortOrder: dto.sortOrder,
        }),

        // ...(dto.isActive !== undefined && {
        //   isActive: dto.isActive,
        // }),
      });

      return document;
    }

    // Сохраняем новый файл ДО изменения БД.
    const savedFile =
      await this.mediaService.save(
        file,
        'document',
      );

    const oldFileUrl =
      document.fileUrl;

    const transaction =
      await this.sequelize.transaction();

    try {
      await document.update(
        {
          ...(dto.title !== undefined && {
            title: dto.title,
          }),

          ...(dto.description !== undefined && {
            description: dto.description,
          }),

          ...(dto.sortOrder !== undefined && {
            sortOrder: dto.sortOrder,
          }),

          // ...(dto.isActive !== undefined && {
          //   isActive: dto.isActive,
          // }),

          fileUrl: savedFile.url,
          fileName:
            savedFile.originalName,
          fileType:
            savedFile.fileType,
        },
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      // БД не обновилась —
      // новый файл больше не нужен.
      try {
        await this.mediaService.removeFile(
          savedFile.filename,
        );
      } catch {
        // Игнорируем ошибку очистки
      }

      throw error;
    }

    // БД уже указывает на новый файл.
    // Теперь удаляем старый.
    const oldFilename =
      this.getFilenameFromUrl(
        oldFileUrl,
      );

    if (oldFilename) {
      try {
        await this.mediaService.removeFile(
          oldFilename,
        );
      } catch {
        // Старый файл можно удалить отдельно позже.
      }
    }

    return document;
  }

  /**
   * Удалить документ
   */
  async remove(id: string) {
    const document =
      await this.documentModel.findByPk(id);

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    const filename =
      this.getFilenameFromUrl(
        document.fileUrl,
      );

    await document.destroy();

    if (filename) {
      try {
        await this.mediaService.removeFile(
          filename,
        );
      } catch {
        // Запись из БД уже удалена.
        // Ошибку удаления файла не возвращаем.
      }
    }

    return {
      message: 'Document deleted',
    };
  }

  /**
   * Извлекает физическое имя файла
   * из URL:
   *
   * /uploads/files/example.pdf
   *
   * → example.pdf
   */
  private getFilenameFromUrl(
    url: string,
  ): string | null {
    if (!url) {
      return null;
    }

    const parts =
      url.split('/');

    const filename =
      parts.at(-1);

    return filename || null;
  }

  /**
   * Установить активность документа
   */
  async setActive(
    id: string,
    isActive: boolean,
  ) {
    const document =
      await this.documentModel.findByPk(id);

    if (!document) {
      throw new NotFoundException(
        'Document not found',
      );
    }

    await document.update({
      isActive,
    });

    return document;
  }
}