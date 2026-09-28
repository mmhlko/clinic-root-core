import { Module } from '@nestjs/common';

import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { MediaModel } from './media.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      MediaModel
    ]),
  ],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}