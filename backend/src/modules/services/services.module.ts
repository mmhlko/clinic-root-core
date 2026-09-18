import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ServiceModel } from './service.model.js';
import { ServicesService } from './services.service.js';
import { ServiceDirectionModel } from './directions/service-direction.model.js';
import { ServicesController } from './services.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ServiceModel,
      ServiceDirectionModel,
    ]),
  ],
  providers: [ServicesService],
  controllers: [ServicesController],
  exports: [ServicesService],
})
export class ServicesModule {}