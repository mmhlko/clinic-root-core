import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppointmentRequestModel } from '../appointment-requests/appointment-request.model.js';
import { DoctorModel } from '../doctors/doctor.model.js';
import { ServiceModel } from '../services/service.model.js';
import { ServiceDirectionModel } from '../services/directions/service-direction.model.js';
import { ReviewModel } from '../reviews/review.model.js';
import { PromotionModel } from '../promotions/promotion.model.js';
import { DocumentModel } from '../documents/document.model.js';
import { FaqModel } from '../faq/faq.model.js';

import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AppointmentRequestModel,
      DoctorModel,
      ServiceModel,
      ServiceDirectionModel,
      ReviewModel,
      PromotionModel,
      DocumentModel,
      FaqModel,
    ]),
  ],

  controllers: [
    DashboardController,
  ],

  providers: [
    DashboardService,
  ],
})
export class DashboardModule {}