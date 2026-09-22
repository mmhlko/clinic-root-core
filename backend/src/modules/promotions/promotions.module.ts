import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PromotionModel } from './promotion.model.js';
import { ServiceModel } from '../services/service.model.js';

import { PromotionsService } from './promotions.service.js';
import { PromotionsController } from './promotions.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PromotionModel,
      ServiceModel,
    ]),
  ],

  controllers: [
    PromotionsController,
  ],

  providers: [
    PromotionsService,
  ],

  exports: [
    PromotionsService,
  ],
})
export class PromotionsModule {}