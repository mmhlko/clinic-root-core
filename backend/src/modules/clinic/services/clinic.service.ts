import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

import { ClinicModel } from '../models/clinic.model.js';

import { UpdateClinicDto } from '../dto/update-clinic.dto.js';
import { ClinicStatus } from '../enum/clinic-status.enum.js';
import { ClinicTenantContextStore } from '../tenant/tenant-context.store.js';
import { UserModel } from '../../users/user.model.js';
import { UserRole } from '../../users/user-role.enum.js';
import { CreateTenantClinicDto } from '../dto/create-tenant-clinic.dto.js';
import { UpdatePlatformClinicDto } from '../dto/update-platform-clinic.dto.js';

@Injectable()
export class ClinicService {
  private readonly reservedSlugs = new Set(['admin', 'api', 'uploads', '_next', 'favicon.ico']);
  constructor(
    @InjectModel(ClinicModel)
    private readonly clinicModel:
      typeof ClinicModel,
    private readonly tenantContext: ClinicTenantContextStore,
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async createPlatformClinic(dto: CreateTenantClinicDto) {
    const slug = dto.clinic.slug?.trim().toLowerCase();
    if (!slug) throw new BadRequestException('Clinic slug is required');
    if (this.reservedSlugs.has(slug)) throw new BadRequestException('This clinic slug is reserved');

    const email = dto.admin.email.trim().toLowerCase();
    try {
      return await this.sequelize.transaction(async (transaction) => {
        const clinic = await this.clinicModel.create({
          name: dto.clinic.name,
          slug,
          status: ClinicStatus.DEMO,
          isSystemDemo: false,
          shortDescription: dto.clinic.shortDescription ?? null,
          description: dto.clinic.description ?? null,
          slogan: dto.clinic.slogan ?? null,
          phone: dto.clinic.phone ?? null,
          email: dto.clinic.email ?? null,
          legalName: dto.clinic.legalName ?? null,
          licenseNumber: dto.clinic.licenseNumber ?? null,
          licenseDate: dto.clinic.licenseDate ? new Date(dto.clinic.licenseDate) : null,
          inn: dto.clinic.inn ?? null,
          ogrn: dto.clinic.ogrn ?? null,
        }, { transaction });

        const admin = await this.userModel.create({
          firstName: dto.admin.firstName,
          lastName: dto.admin.lastName,
          email,
          password: await bcrypt.hash(dto.admin.password, 10),
          role: UserRole.ADMIN,
          clinicId: clinic.id,
          locationId: null,
          photoMediaId: null,
        }, { transaction });

        return {
          clinic,
          admin: {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            initialPassword: dto.admin.password,
          },
        };
      });
    } catch (error) {
      if ((error as { name?: string })?.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Clinic slug or administrator email is already in use');
      }
      throw error;
    }
  }

  findAllForPlatform() {
    return this.clinicModel.findAll({ order: [['createdAt', 'DESC']] });
  }

  async updateForPlatform(id: string, dto: UpdatePlatformClinicDto) {
    const clinic = await this.clinicModel.findByPk(id);
    if (!clinic) throw new NotFoundException('Clinic not found');
    if (clinic.isSystemDemo && (dto.slug || (dto.status && dto.status !== ClinicStatus.DEMO))) {
      throw new ConflictException('System demo clinic slug and status are fixed');
    }
    if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase();
      if (this.reservedSlugs.has(slug)) throw new BadRequestException('This clinic slug is reserved');
      clinic.slug = slug;
    }
    if (dto.status !== undefined) clinic.status = dto.status;
    await clinic.save();
    return clinic;
  }

  async findPublic() {
    const { clinicId } = this.tenantContext.require();
    const clinic = await this.clinicModel.findByPk(clinicId);

    if (!clinic) {
      throw new NotFoundException(
        'Clinic not found',
      );
    }

    return clinic;
  }

  async findAdmin() {
    const { clinicId } = this.tenantContext.require();
    const clinic = await this.clinicModel.findByPk(clinicId);

    if (!clinic) {
      throw new NotFoundException(
        'Clinic not found',
      );
    }

    return clinic;
  }

  async update(dto: UpdateClinicDto) {
    const { clinicId } = this.tenantContext.require();
    const clinic = await this.clinicModel.findByPk(clinicId);

    if (!clinic) {
      throw new NotFoundException(
        'Clinic not found',
      );
    }

    if (dto.name !== undefined) {
      clinic.name = dto.name;
    }

    if (dto.shortDescription !== undefined) {
      clinic.shortDescription =
        dto.shortDescription;
    }

    if (dto.description !== undefined) {
      clinic.description =
        dto.description;
    }

    if (dto.slogan !== undefined) {
      clinic.slogan = dto.slogan;
    }

    if (dto.phone !== undefined) {
      clinic.phone = dto.phone;
    }

    if (dto.email !== undefined) {
      clinic.email = dto.email;
    }

    if (dto.legalName !== undefined) {
      clinic.legalName =
        dto.legalName;
    }

    if (dto.licenseNumber !== undefined) {
      clinic.licenseNumber =
        dto.licenseNumber;
    }

    if (dto.licenseDate !== undefined) {
      clinic.licenseDate =
        dto.licenseDate
          ? new Date(dto.licenseDate)
          : null;
    }

    if (dto.inn !== undefined) {
      clinic.inn = dto.inn;
    }

    if (dto.ogrn !== undefined) {
      clinic.ogrn = dto.ogrn;
    }

    await clinic.save();

    return clinic;
  }
}
