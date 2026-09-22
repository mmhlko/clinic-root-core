import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ClinicLocationModel } from './models/clinic-location.model.js';
import { ClinicLocationController } from './controllers/clinic-location.controller.js';
import { ClinicLocationService } from './services/clinic-location.service.js';

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