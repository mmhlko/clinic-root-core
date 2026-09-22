import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';


import { CreateClinicLocationDto } from '../dto/create-clinic-location.dto.js';
import { UpdateClinicLocationDto } from '../dto/update-clinic-location.dto.js';
import { ClinicLocationModel } from '../models/clinic-location.model.js';

@Injectable()
export class ClinicLocationService {
  constructor(
    @InjectModel(ClinicLocationModel)
    private readonly clinicLocationModel:
      typeof ClinicLocationModel,
  ) {}

  async create(dto: CreateClinicLocationDto) {
    const existingLocation =
      await this.clinicLocationModel.findOne({
        where: {
          name: dto.name,
        },
      });

    if (existingLocation) {
      throw new ConflictException(
        'Clinic location already exists',
      );
    }

    return this.clinicLocationModel.create({
      name: dto.name,
      address: dto.address,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      workingHours: dto.workingHours ?? null,
      mapUrl: dto.mapUrl ?? null,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(onlyActive = false) {
    return this.clinicLocationModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,

      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });
  }

  async findById(id: string) {
    const location =
      await this.clinicLocationModel.findByPk(id);

    if (!location) {
      throw new NotFoundException(
        'Clinic location not found',
      );
    }

    return location;
  }

  async update(
    id: string,
    dto: UpdateClinicLocationDto,
  ) {
    const location =
      await this.findById(id);

    if (
      dto.name !== undefined &&
      dto.name !== location.name
    ) {
      const existingLocation =
        await this.clinicLocationModel.findOne({
          where: {
            name: dto.name,
          },
        });

      if (
        existingLocation &&
        existingLocation.id !== location.id
      ) {
        throw new ConflictException(
          'Clinic location already exists',
        );
      }

      location.name = dto.name;
    }

    if (dto.address !== undefined) {
      location.address = dto.address;
    }

    if (dto.phone !== undefined) {
      location.phone = dto.phone;
    }

    if (dto.email !== undefined) {
      location.email = dto.email;
    }

    if (dto.workingHours !== undefined) {
      location.workingHours =
        dto.workingHours;
    }

    if (dto.mapUrl !== undefined) {
      location.mapUrl = dto.mapUrl;
    }

    if (dto.description !== undefined) {
      location.description =
        dto.description;
    }

    if (dto.sortOrder !== undefined) {
      location.sortOrder =
        dto.sortOrder;
    }

    await location.save();

    return location;
  }

  async setActive(
    id: string,
    isActive: boolean,
  ) {
    const location =
      await this.findById(id);

    location.isActive = isActive;

    await location.save();

    return location;
  }
}