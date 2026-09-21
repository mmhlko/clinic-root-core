import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ClinicLocationModel } from './clinic-location.model.js';
import { ClinicLocationService } from './clinic-location.service.js';
import { ClinicLocationController } from './clinic-location.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ClinicLocationModel,
    ]),
  ],
  providers: [ClinicLocationService],
  controllers: [ClinicLocationController],
  exports: [ClinicLocationService],
})
export class ClinicLocationModule {}