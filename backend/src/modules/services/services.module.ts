import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ServiceModel } from './service.model.js';
import { ServicesService } from './services.service.js';
import { ServiceDirectionModel } from './directions/service-direction.model.js';
import { ServicesController } from './services.controller.js';
import { AppointmentRequestModel } from '../appointment-requests/appointment-request.model.js';
import { PromotionModel } from '../promotions/promotion.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ServiceModel,
      ServiceDirectionModel,
      AppointmentRequestModel,
      PromotionModel,
    ]),
  ],
  providers: [ServicesService],
  controllers: [ServicesController],
  exports: [ServicesService],
})
export class ServicesModule {}