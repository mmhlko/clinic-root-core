import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClinicModel } from '../models/clinic.model.js';
import { ClinicTenantInterceptor } from './clinic-tenant.interceptor.js';
import { ClinicTenantModelScope } from './clinic-tenant-model-scope.js';
import { ClinicTenantResolver } from './clinic-tenant.resolver.js';
import { ClinicTenantContextStore } from './tenant-context.store.js';

@Module({
  imports: [SequelizeModule.forFeature([ClinicModel])],
  providers: [
    ClinicTenantContextStore,
    ClinicTenantResolver,
    ClinicTenantModelScope,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClinicTenantInterceptor,
    },
  ],
  exports: [ClinicTenantContextStore],
})
export class ClinicTenantModule {}
