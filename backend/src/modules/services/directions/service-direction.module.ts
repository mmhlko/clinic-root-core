import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ServiceDirectionModel } from './service-direction.model.js';
import { ServiceDirectionService } from './service-direction.service.js';
import { ServiceDirectionController } from './service-direction.controller.js';
import { ServiceModel } from '../service.model.js';
import { DoctorDirectionModel } from '../../doctors/doctor-direction.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ServiceDirectionModel,
      ServiceModel,
      DoctorDirectionModel,
    ]),
  ],
  providers: [ServiceDirectionService],
  controllers: [ServiceDirectionController],
  exports: [ServiceDirectionService],
})
export class ServiceDirectionModule {}