import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppointmentRequestModel } from './appointment-request.model.js';
import { AppointmentRequestsController } from './appointment-requests.controller.js';
import { AppointmentRequestsService } from './appointment-requests.service.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AppointmentRequestModel,
    ]),
  ],
  controllers: [
    AppointmentRequestsController,
  ],
  providers: [
    AppointmentRequestsService,
  ],
})
export class AppointmentRequestsModule {}