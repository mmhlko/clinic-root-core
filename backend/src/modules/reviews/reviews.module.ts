import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ReviewModel } from './review.model.js';
import { DoctorModel } from '../doctors/doctor.model.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ReviewModel,
      DoctorModel,
    ]),
  ],

  providers: [ReviewsService],
  controllers: [ReviewsController],

  exports: [ReviewsService],
})
export class ReviewsModule {}