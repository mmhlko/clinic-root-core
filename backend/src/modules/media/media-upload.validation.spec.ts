import {
  validateMediaUploadContent,
  validateMediaUploadMetadata,
} from './media-upload.validation.js';

function uploadFile(
  originalname: string,
  mimetype: string,
  buffer: Buffer,
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype,
    size: buffer.byteLength,
    buffer,
  } as Express.Multer.File;
}

describe('media upload validation', () => {
  it('accepts content whose signature, MIME type, and extension match', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6ioAAAAASUVORK5CYII=',
      'base64',
    );

    await expect(
      validateMediaUploadContent(
        uploadFile('image.png', 'image/png', png),
        'image',
      ),
    ).resolves.toBeUndefined();
  });

  it('rejects an HTML payload renamed and declared as an image', async () => {
    const html = Buffer.from('<script>alert(1)</script>');

    await expect(
      validateMediaUploadContent(
        uploadFile('image.png', 'image/png', html),
        'image',
      ),
    ).rejects.toThrow('Invalid image file content');
  });

  it('rejects a MIME and extension mismatch before parsing content', () => {
    expect(() =>
      validateMediaUploadMetadata(
        {
          originalname: 'image.svg',
          mimetype: 'image/svg+xml',
        },
        'image',
      ),
    ).toThrow('Invalid image file type or extension');
  });

  it('rejects content over the configured size limit', async () => {
    const buffer = Buffer.alloc(5 * 1024 * 1024 + 1);

    await expect(
      validateMediaUploadContent(
        uploadFile('image.png', 'image/png', buffer),
        'image',
      ),
    ).rejects.toThrow('Invalid image file size');
  });
});
