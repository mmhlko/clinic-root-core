import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { UserRole } from '../../users/user-role.enum.js';

export interface ClinicTenantContext {
  clinicId: string;
  clinicSlug: string;
  actorId: string | null;
  actorRole: UserRole | null;
  isPublic: boolean;
}

@Injectable()
export class ClinicTenantContextStore {
  private readonly storage = new AsyncLocalStorage<ClinicTenantContext>();

  run<T>(context: ClinicTenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): ClinicTenantContext | undefined {
    return this.storage.getStore();
  }

  require(): ClinicTenantContext {
    const context = this.get();
    if (!context) {
      throw new InternalServerErrorException('Clinic tenant context is missing');
    }
    return context;
  }
}
