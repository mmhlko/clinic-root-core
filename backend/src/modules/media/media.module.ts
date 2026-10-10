import { Module } from '@nestjs/common';

import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { MediaModel } from './media.model.js';
import { ClinicTenantModule } from '../clinic/tenant/clinic-tenant.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      MediaModel
    ]),
    ClinicTenantModule,
  ],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
