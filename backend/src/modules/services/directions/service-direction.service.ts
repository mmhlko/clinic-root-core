import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { ServiceDirectionModel } from './service-direction.model.js';
import { CreateServiceDirectionDto } from './dto/create-service-direction.dto.js';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ServiceDirectionService {
  constructor(
    @InjectModel(ServiceDirectionModel)
    private readonly serviceDirectionModel: typeof ServiceDirectionModel,
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