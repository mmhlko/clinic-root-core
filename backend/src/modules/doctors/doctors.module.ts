import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { DoctorEducationModel } from './doctor-education.model.js';
import { DoctorModel } from './doctor.model.js';
import { DoctorsService } from './doctors.service.js';
import { DoctorsController } from './doctors.controller.js';
import { DoctorDirectionModel } from './doctor-direction.model.js';
import { ServiceDirectionModel } from '../services/directions/service-direction.model.js';
import { SkillModel } from './skills/skill.model.js';
import { DoctorSkillModel } from './skills/doctor-skill.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DoctorModel,
      DoctorEducationModel,
      DoctorDirectionModel,
      ServiceDirectionModel,
      SkillModel,
      DoctorSkillModel,
    ]),
  ],
  providers: [DoctorsService],
  controllers: [DoctorsController],
  exports: [DoctorsService],
})
export class DoctorsModule {}