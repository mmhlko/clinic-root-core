import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  memoryStorage,
} from 'multer';
import {
  MEDIA_UPLOAD_CONFIG,
  validateMediaUploadMetadata,
  type MediaUploadType,
} from '../media-upload.validation.js';

export function UploadMedia(
  type: MediaUploadType,
) {
  const config = MEDIA_UPLOAD_CONFIG[type];

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
        required: ['file'],
      },
    }),
    UseInterceptors(
      FileInterceptor('file', {
        storage: memoryStorage(),
        defParamCharset: 'utf8',

        limits: {
          fileSize: config.maxSize,
        },

        fileFilter: (
          _req,
          file,
          callback,
        ) => {
          try {
            validateMediaUploadMetadata(file, type);
          } catch (error) {
            callback(
              error instanceof Error
                ? error
                : new Error(`Invalid ${type} file metadata`),
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