import {
  BadRequestException,
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  memoryStorage,
} from 'multer';

type MediaType = 'image' | 'document';

const MEDIA_CONFIG = {
  image: {
    maxSize: 5 * 1024 * 1024,

    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
  },

  document: {
    maxSize: 10 * 1024 * 1024,

    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
} satisfies Record<
  MediaType,
  {
    maxSize: number;
    mimeTypes: string[];
  }
>;

export function UploadMedia(
  type: MediaType,
) {
  const config = MEDIA_CONFIG[type];

  return applyDecorators(
    UseInterceptors(
      FileInterceptor('file', {
        storage: memoryStorage(),

        limits: {
          fileSize: config.maxSize,
        },

        fileFilter: (
          _req,
          file,
          callback,
        ) => {
          if (
            !config.mimeTypes.includes(
              file.mimetype,
            )
          ) {
            callback(
              new BadRequestException(
                `Invalid ${type} file type`,
              ),
              false,
            );

            return;
          }

          callback(null, true);
        },
      }),
    ),
  );
}