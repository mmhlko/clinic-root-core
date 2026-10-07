import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { ServiceDirectionModel } from './service-direction.model.js';
import { CreateServiceDirectionDto } from './dto/create-service-direction.dto.js';
import { UpdateServiceDirectionDto } from './dto/update-service-direction.dto.js';
import { Sequelize } from 'sequelize-typescript';
import { ServiceModel } from '../service.model.js';
import { DoctorDirectionModel } from '../../doctors/doctor-direction.model.js';

@Injectable()
export class ServiceDirectionService {
  constructor(
    @InjectModel(ServiceDirectionModel)
    private readonly serviceDirectionModel: typeof ServiceDirectionModel,
    @InjectModel(ServiceModel)
    private readonly serviceModel: typeof ServiceModel,
    @InjectModel(DoctorDirectionModel)
    private readonly doctorDirectionModel: typeof DoctorDirectionModel,
    private readonly sequelize: Sequelize,
  ) { }

  async create(dto: CreateServiceDirectionDto) {
    const existingDirection =
      await this.serviceDirectionModel.findOne({
        where: { name: dto.name },
      });

    if (existingDirection) {
      throw new ConflictException(
        'Service direction already exists',
      );
    }

    return this.serviceDirectionModel.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(onlyActive: boolean = false) {
    return this.serviceDirectionModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,
      order: [['sortOrder', 'ASC']],
    });
  }

  async update(id: string, dto: UpdateServiceDirectionDto) {
    const direction = await this.serviceDirectionModel.findByPk(id);

    if (!direction) {
      throw new NotFoundException('Service direction not found');
    }

    if (dto.name !== undefined && dto.name !== direction.name) {
      const existingDirection = await this.serviceDirectionModel.findOne({
        where: { name: dto.name },
      });

      if (existingDirection) {
        throw new ConflictException('Service direction already exists');
      }

      direction.name = dto.name;
    }

    if (dto.description !== undefined) direction.description = dto.description;
    if (dto.sortOrder !== undefined) direction.sortOrder = dto.sortOrder;

    await direction.save();
    return direction;
  }

  async remove(id: string) {
    const direction = await this.serviceDirectionModel.findByPk(id);

    if (!direction) {
      throw new NotFoundException('Service direction not found');
    }

    const [servicesCount, doctorsCount] = await Promise.all([
      this.serviceModel.count({ where: { directionId: id } }),
      this.doctorDirectionModel.count({ where: { directionId: id } }),
    ]);

    if (servicesCount || doctorsCount) {
      throw new ConflictException(
        'Cannot delete a direction that is assigned to services or doctors',
      );
    }

    await direction.destroy();
    return { success: true };
  }

  async reorderServiceDirections(serviceDirectionIds: string[]) {
    return this.sequelize.transaction(async (transaction) => {
      const serviceDirections = await this.serviceDirectionModel.findAll({
        where: {
          id: serviceDirectionIds,
        },

        transaction,
      });

      if (serviceDirections.length !== serviceDirectionIds.length) {
        throw new NotFoundException('One or more service directions not found');
      }

      const serviceDirectionsById = new Map(serviceDirections.map((serviceDirection) => [serviceDirection.id, serviceDirection]));

      for (const [index, serviceDirectionId] of serviceDirectionIds.entries()) {
        const serviceDirection = serviceDirectionsById.get(serviceDirectionId);

        if (!serviceDirection) {
          throw new NotFoundException(`ServiceDirection ${serviceDirectionId} not found`);
        }

        serviceDirection.sortOrder = index;

        await serviceDirection.save({
          transaction,
        });
      }

      return {
        success: true,
      };
    });
  }
}