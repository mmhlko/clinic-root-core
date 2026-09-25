import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
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

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
