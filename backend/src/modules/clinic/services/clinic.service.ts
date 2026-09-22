import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { ClinicModel } from '../models/clinic.model.js';

import { CreateClinicDto } from '../dto/create-clinic.dto.js';
import { UpdateClinicDto } from '../dto/update-clinic.dto.js';

@Injectable()
export class ClinicService {
  constructor(
    @InjectModel(ClinicModel)
    private readonly clinicModel:
      typeof ClinicModel,
  ) {}

  async create(dto: CreateClinicDto) {
    const existingClinic =
      await this.clinicModel.findOne();

    if (existingClinic) {
      throw new ConflictException(
        'Clinic already exists',
      );
    }

    return this.clinicModel.create({
      name: dto.name,
      shortDescription:
        dto.shortDescription ?? null,
      description: dto.description ?? null,
      slogan: dto.slogan ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      legalName: dto.legalName ?? null,
      licenseNumber:
        dto.licenseNumber ?? null,
      licenseDate: dto.licenseDate
        ? new Date(dto.licenseDate)
        : null,
      inn: dto.inn ?? null,
      ogrn: dto.ogrn ?? null,
    });
  }

  async findPublic() {
    const clinic =
      await this.clinicModel.findOne(/* {
        attributes: [
          'id',
          'name',
          'shortDescription',
          'description',
          'slogan',
          'logoUrl',
          'faviconUrl',
          'phone',
          'email',
        ],
      } */);

    if (!clinic) {
      throw new NotFoundException(
        'Clinic not found',
      );
    }

    return clinic;
  }

  async findAdmin() {
    const clinic =
      await this.clinicModel.findOne();

    if (!clinic) {
      throw new NotFoundException(
        'Clinic not found',
      );
    }

    return clinic;
  }

  async update(dto: UpdateClinicDto) {
    const clinic =
      await this.clinicModel.findOne();

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