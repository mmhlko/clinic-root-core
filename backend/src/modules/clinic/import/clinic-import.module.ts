import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClinicModel } from '../models/clinic.model.js';
import { ClinicLocationModel } from '../models/clinic-location.model.js';
import { ClinicSocialLinkModel } from '../models/clinic-social-link.model.js';
import { ClinicStatisticModel } from '../models/clinic-statistic.model.js';
import { ClinicFeatureModel } from '../models/clinic-feature.model.js';
import { ClinicTenantModule } from '../tenant/clinic-tenant.module.js';
import { ServiceDirectionModel } from '../../services/directions/service-direction.model.js';
import { ServiceModel } from '../../services/service.model.js';
import { DoctorModel } from '../../doctors/doctor.model.js';
import { ReviewModel } from '../../reviews/review.model.js';
import { FaqModel } from '../../faq/faq.model.js';
import { PromotionModel } from '../../promotions/promotion.model.js';
import { DocumentModel } from '../../documents/document.model.js';
import { MediaModule } from '../../media/media.module.js';
import { ClinicImportService } from './clinic-import.service.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ClinicModel,
      ClinicLocationModel,
      ClinicSocialLinkModel,
      ClinicStatisticModel,
      ClinicFeatureModel,
      ServiceDirectionModel,
      ServiceModel,
      DoctorModel,
      ReviewModel,
      FaqModel,
      PromotionModel,
      DocumentModel,
    ]),
    ClinicTenantModule,
    MediaModule,
  ],
  providers: [ClinicImportService],
  exports: [ClinicImportService],
})
export class ClinicImportModule {}
