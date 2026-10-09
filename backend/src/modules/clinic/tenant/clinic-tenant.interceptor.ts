import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import type { Request } from 'express';
import { ClinicTenantResolver } from './clinic-tenant.resolver.js';
import { ClinicTenantContextStore } from './tenant-context.store.js';
import { SKIP_CLINIC_TENANT_CONTEXT } from './skip-clinic-tenant.decorator.js';

@Injectable()
export class ClinicTenantInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly resolver: ClinicTenantResolver,
    private readonly contextStore: ClinicTenantContextStore,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_CLINIC_TENANT_CONTEXT,
      [context.getHandler(), context.getClass()],
    );
    if (skip) return next.handle();

    const request = context.switchToHttp().getRequest<Request>();
    return from(this.resolver.resolve(request)).pipe(
      mergeMap(
        (tenantContext) =>
          new Observable((subscriber) =>
            this.contextStore.run(tenantContext, () =>
              next.handle().subscribe(subscriber),
            ),
          ),
      ),
    );
  }
}
