import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { WorkModel } from './work.model.js';
import { ServiceModel } from '../services/service.model.js';

import { WorksService } from './works.service.js';
import { WorksController } from './works.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      WorkModel,
      ServiceModel,
    ]),
  ],

  controllers: [
    WorksController,
  ],

  providers: [
    WorksService,
  ],

  exports: [
    WorksService,
  ],
})
export class WorksModule {}