import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';
import type { Model, ModelStatic, Sequelize } from 'sequelize-typescript';
import { ClinicTenantContextStore } from './tenant-context.store.js';

const TENANT_TABLES = [
  'clinic_locations',
  'clinic_features',
  'clinic_social_links',
  'clinic_statistics',
  'doctors',
  'service_directions',
  'services',
  'skills',
  'doctor_directions',
  'doctor_educations',
  'doctor_skills',
  'reviews',
  'promotions',
  'works',
  'faq',
  'documents',
  'appointment_requests',
  'media',
] as const;

type ScopedOptions = {
  where?: WhereOptions;
  hooks?: boolean;
  include?: unknown;
};

type TenantModel = ModelStatic<Model> & {
  tableName: string;
  addHook: (name: string, hookName: string, callback: (...args: any[]) => unknown) => void;
};

@Injectable()
export class ClinicTenantModelScope implements OnModuleInit {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly contextStore: ClinicTenantContextStore,
  ) {}

  onModuleInit() {
    for (const tableName of TENANT_TABLES) {
      const model = this.sequelize.modelManager.models.find(
        (registeredModel) => registeredModel.getTableName() === tableName,
      ) as TenantModel | undefined;

      if (!model) {
        throw new Error(`Tenant model is not registered: ${tableName}`);
      }

      model.addHook('beforeFind', 'clinicTenantFindScope', (options: ScopedOptions) => {
        this.scopeOptions(options);
      });
      model.addHook('beforeCount', 'clinicTenantCountScope', (options: ScopedOptions) => {
        this.scopeOptions(options);
      });
      model.addHook('beforeBulkUpdate', 'clinicTenantUpdateScope', (options: ScopedOptions) => {
        this.scopeOptions(options);
      });
      model.addHook('beforeBulkDestroy', 'clinicTenantDestroyScope', (options: ScopedOptions) => {
        this.scopeOptions(options);
      });
      model.addHook('beforeCreate', 'clinicTenantAssignCreate', (instance: Model) => {
        this.assignTenant(instance);
      });
      model.addHook('beforeBulkCreate', 'clinicTenantAssignBulkCreate', (instances: Model[]) => {
        instances.forEach((instance) => this.assignTenant(instance));
      });
      model.addHook('beforeUpsert', 'clinicTenantUpsertScope', (values: Record<string, unknown>, options: ScopedOptions) => {
        values.clinicId = this.contextStore.require().clinicId;
        this.scopeOptions(options);
      });
      model.addHook('beforeUpdate', 'clinicTenantUpdateInstance', (instance: Model) => {
        this.assertTenant(instance);
      });
      model.addHook('beforeDestroy', 'clinicTenantDestroyInstance', (instance: Model) => {
        this.assertTenant(instance);
      });
    }
  }

  private scopeOptions(options: ScopedOptions) {
    if (options.hooks === false) return;
    const clinicId = this.contextStore.require().clinicId;
    options.where = {
      [Op.and]: [options.where ?? {}, { clinicId }],
    };
  }

  private assignTenant(instance: Model) {
    instance.set('clinicId', this.contextStore.require().clinicId);
  }

  private assertTenant(instance: Model) {
    const clinicId = this.contextStore.require().clinicId;
    if (instance.get('clinicId') !== clinicId) {
      throw new NotFoundException('Record not found');
    }
  }
}
