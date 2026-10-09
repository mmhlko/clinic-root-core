import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';
import { ClinicModel } from '../models/clinic.model.js';
import { ClinicStatus } from '../enum/clinic-status.enum.js';
import { UserRole } from '../../users/user-role.enum.js';
import type { ClinicTenantContext } from './tenant-context.store.js';

interface ClinicRequestUser {
  sub: string;
  role: UserRole;
  clinicId: string | null;
}

@Injectable()
export class ClinicTenantResolver {
  constructor(
    @InjectModel(ClinicModel)
    private readonly clinicModel: typeof ClinicModel,
  ) {}

  async resolve(request: Request): Promise<ClinicTenantContext> {
    const user = request.user as ClinicRequestUser | undefined;
    const requestedSlug = this.getRequestedSlug(request);

    if (!user) {
      const clinic = await this.findBySlug(requestedSlug ?? 'demo');
      if (clinic.status === ClinicStatus.ARCHIVED) {
        throw new NotFoundException('Clinic not found');
      }

      return this.contextFor(clinic, null, null, true);
    }

    if (user.role === UserRole.ROOT) {
      const clinic = await this.findBySlug(requestedSlug ?? 'demo');
      return this.contextFor(clinic, user.sub, user.role, false);
    }

    if (!user.clinicId) {
      throw new ForbiddenException('User is not assigned to a clinic');
    }

    const clinic = await this.clinicModel.findByPk(user.clinicId);
    if (!clinic || clinic.status === ClinicStatus.ARCHIVED) {
      throw new ForbiddenException('Clinic access is unavailable');
    }
    if (requestedSlug && requestedSlug !== clinic.slug) {
      throw new ForbiddenException('User cannot switch clinics');
    }

    return this.contextFor(clinic, user.sub, user.role, false);
  }

  private getRequestedSlug(request: Request): string | undefined {
    const value = request.headers['x-clinic-slug'];
    if (value === undefined) return undefined;
    if (Array.isArray(value) || typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException('Invalid X-Clinic-Slug header');
    }
    return value.trim().toLowerCase();
  }

  private async findBySlug(slug: string): Promise<ClinicModel> {
    const clinic = await this.clinicModel.findOne({ where: { slug } });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  private contextFor(
    clinic: ClinicModel,
    actorId: string | null,
    actorRole: UserRole | null,
    isPublic: boolean,
  ): ClinicTenantContext {
    return {
      clinicId: clinic.id,
      clinicSlug: clinic.slug,
      actorId,
      actorRole,
      isPublic,
    };
  }
}
