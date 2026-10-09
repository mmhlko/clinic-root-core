import { SetMetadata } from '@nestjs/common';

export const SKIP_CLINIC_TENANT_CONTEXT = 'skipClinicTenantContext';

export const SkipClinicTenantContext = () =>
  SetMetadata(SKIP_CLINIC_TENANT_CONTEXT, true);
