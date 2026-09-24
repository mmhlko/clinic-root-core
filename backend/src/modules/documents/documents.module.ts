import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentModel } from './document.model.js';
import { MediaModule } from '../media/media.module.js';
import { DocumentsService } from './documents.service.js';
import { DocumentsController } from './documents.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DocumentModel,
    ]),
    MediaModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [
    SequelizeModule,
  ],
})
export class DocumentsModule {}