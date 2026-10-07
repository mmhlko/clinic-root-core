import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ERROR_MESSAGES } from './shared/constants/error-messages.js';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter.js';
import { ThrottlerExceptionFilter } from './shared/filters/еhrottler-exception-filter.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

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

  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<string>('PORT'));
}
await bootstrap();
