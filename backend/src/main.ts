import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ERROR_MESSAGES } from './shared/constants/error-messages.js';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter.js';
import { ThrottlerExceptionFilter } from './shared/filters/еhrottler-exception-filter.js';
import { MediaService } from './modules/media/media.service.js';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  const mediaService = app.get(MediaService);
  const configService = app.get(ConfigService);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({
    origin: configService
      .getOrThrow<string>('CORS_ORIGINS')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });

  app.use('/uploads/files', (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Disposition', 'attachment');
    next();
  });

  app.use('/uploads', async (req: Request, res: Response, next: NextFunction) => {
    const requestPath = decodeURIComponent(req.path || '/');
    const filename = requestPath.split('/').filter(Boolean).at(-1);

    if (!filename || filename.includes('..')) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const isAllowed = await mediaService.isAllowedPublicUpload(filename);

    if (!isAllowed) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    // res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: () => new BadRequestException(ERROR_MESSAGES.invalidInput),
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(app.get(HttpAdapterHost)));
  app.useGlobalFilters(
    new ThrottlerExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Clinics API')
    .setDescription('Документация REST API для платформы клиник')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Введите JWT access token без префикса Bearer',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Clinics API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });
  app.use('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  await app.listen(configService.getOrThrow<string>('PORT'));
}
await bootstrap();
