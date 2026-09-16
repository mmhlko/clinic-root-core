import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { DoctorEducationModel } from './doctor-education.model.js';
import { DoctorModel } from './doctor.model.js';
import { DoctorsService } from './doctors.service.js';
import { DoctorsController } from './doctors.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DoctorModel,
      DoctorEducationModel,
    ]),
  ],
  providers: [DoctorsService],
  controllers: [DoctorsController],
  exports: [DoctorsService],
})
export class DoctorsModule {}