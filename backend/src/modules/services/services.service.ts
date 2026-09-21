import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { ServiceModel } from './service.model.js';

import { CreateServiceDto } from './dto/create-service.dto.js';
import { ServiceDirectionModel } from './directions/service-direction.model.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceModel)
    private readonly serviceModel: typeof ServiceModel,

    @InjectModel(ServiceDirectionModel)
    private readonly serviceDirectionModel: typeof ServiceDirectionModel,
  ) { }

  async create(dto: CreateServiceDto) {
    const direction =
      await this.serviceDirectionModel.findOne({
        where: {
          id: dto.directionId,
          isActive: true,
        },
      });

    if (!direction) {
      throw new NotFoundException(
        'Service direction not found',
      );
    }

    const existingService =
      await this.serviceModel.findOne({
        where: {
          directionId: dto.directionId,
          name: dto.name,
        },
      });

    if (existingService) {
      throw new ConflictException(
        'Service already exists in this direction',
      );
    }

    return this.serviceModel.create({
      directionId: dto.directionId,
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price ?? null,
      isPriceFrom: dto.isPriceFrom ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(onlyActive = false) {
    return this.serviceModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,
      order: [['sortOrder', 'ASC']],
      include: [
        {
          model: ServiceDirectionModel,
          as: 'direction',
          where: onlyActive
            ? { isActive: true }
            : undefined,
          required: onlyActive,
        },
      ],
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.serviceModel.findByPk(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (dto.directionId !== undefined) {
      const direction =
        await this.serviceDirectionModel.findOne({
          where: {
            id: dto.directionId,
            isActive: true,
          },
        });

      if (!direction) {
        throw new NotFoundException(
          'Service direction not found',
        );
      }

      service.directionId = dto.directionId;
    }

    if (dto.name !== undefined) {
      const existingService =
        await this.serviceModel.findOne({
          where: {
            directionId: service.directionId,
            name: dto.name,
          },
        });

      if (
        existingService &&
        existingService.id !== service.id
      ) {
        throw new ConflictException(
          'Service already exists in this direction',
        );
      }

      service.name = dto.name;
    }

    if (dto.description !== undefined) {
      service.description = dto.description;
    }

    if (dto.price !== undefined) {
      service.price = dto.price;
    }

    if (dto.isPriceFrom !== undefined) {
      service.isPriceFrom = dto.isPriceFrom;
    }

    if (dto.sortOrder !== undefined) {
      service.sortOrder = dto.sortOrder;
    }

    await service.save();

    return service;
  }

  async setActive(id: string, isActive: boolean) {
    const service = await this.serviceModel.findByPk(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.isActive = isActive;

    await service.save();

    return service;
  }

  async findById({
    id,
    onlyActive = false,
  }: {
    id: string;
    onlyActive?: boolean;
  }) {
    const service =
      await this.serviceModel.findOne({
        where: {
          id,
          ...(onlyActive
            ? { isActive: true }
            : {}),
        },

        include: [
          {
            model: ServiceDirectionModel,
            as: 'direction',
            where: onlyActive
              ? { isActive: true }
              : undefined,
            required: onlyActive,
          },
        ],
      });

    if (!service) {
      throw new NotFoundException(
        'Service not found',
      );
    }

    return service;
  }
}