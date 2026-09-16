import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ServiceDirectionModel } from './service-direction.model.js';
import { ServiceDirectionService } from './service-direction.service.js';
import { ServiceDirectionController } from './service-direction.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ServiceDirectionModel,
    ]),
  ],
  providers: [ServiceDirectionService],
  controllers: [ServiceDirectionController],
  exports: [ServiceDirectionService],
})
export class ServiceDirectionModule {}