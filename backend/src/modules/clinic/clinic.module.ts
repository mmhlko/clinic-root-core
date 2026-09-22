import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ClinicModel } from './models/clinic.model.js';
import { ClinicSocialLinkModel } from './models/clinic-social-link.model.js';

import { ClinicService } from './services/clinic.service.js';
import { ClinicController } from './controllers/clinic.controller.js';

import { ClinicSocialLinkService } from './services/clinic-social-link.service.js';
import { ClinicSocialLinkController } from './controllers/clinic-social-link.controller.js';
import { ClinicFeatureModel } from './models/clinic-feature.model.js';
import { ClinicFeatureController } from './controllers/clinic-feature.controller.js';
import { ClinicFeatureService } from './services/clinic-feature.service.js';
import { ClinicStatisticModel } from './models/clinic-statistic.model.js';
import { ClinicStatisticService } from './services/clinic-statistic.service.js';
import { ClinicStatisticController } from './controllers/clinic-statistic.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ClinicModel,
      ClinicSocialLinkModel,
      ClinicFeatureModel,
      ClinicStatisticModel,
    ]),
  ],

  providers: [
    ClinicService,
    ClinicSocialLinkService,
    ClinicFeatureService,
    ClinicStatisticService,
  ],

  controllers: [
    ClinicController,
    ClinicSocialLinkController,
    ClinicFeatureController,
    ClinicStatisticController,
  ],

  exports: [
    ClinicService,
    ClinicSocialLinkService,
    ClinicFeatureService,
    ClinicStatisticService,
  ],
})
export class ClinicModule {}