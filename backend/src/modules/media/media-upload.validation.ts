import { BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import { extname } from 'path';

export type MediaUploadType = 'image' | 'document';

const MIME_EXTENSIONS = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    'docx',
  ],
} as const;

export const MEDIA_UPLOAD_CONFIG = {
  image: {
    maxSize: 5 * 1024 * 1024,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
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
  MediaUploadType,
  { maxSize: number; mimeTypes: readonly string[] }
>;

type UploadMetadata = Pick<Express.Multer.File, 'originalname' | 'mimetype'>;
type UploadFile = UploadMetadata &
  Pick<
  Express.Multer.File,
  'size' | 'buffer'
  >;

export function validateMediaUploadMetadata(
  file: UploadMetadata,
  type: MediaUploadType,
): void {
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const config = MEDIA_UPLOAD_CONFIG[type];
  const allowedExtensions =
    MIME_EXTENSIONS[file.mimetype as keyof typeof MIME_EXTENSIONS];

  if (
    !config.mimeTypes.includes(file.mimetype) ||
    !allowedExtensions?.some((allowedExtension) => allowedExtension === extension)
  ) {
    throw new BadRequestException(`Invalid ${type} file type or extension`);
  }
}

export async function validateMediaUploadContent(
  file: UploadFile,
  type: MediaUploadType,
): Promise<void> {
  validateMediaUploadMetadata(file, type);

  const config = MEDIA_UPLOAD_CONFIG[type];
  if (
    !file.buffer?.length ||
    file.size <= 0 ||
    file.size > config.maxSize ||
    file.buffer.byteLength !== file.size
  ) {
    throw new BadRequestException(`Invalid ${type} file size`);
  }

  const detectedType = await fileTypeFromBuffer(file.buffer);
  if (!detectedType || detectedType.mime !== file.mimetype) {
    throw new BadRequestException(`Invalid ${type} file content`);
  }
}
