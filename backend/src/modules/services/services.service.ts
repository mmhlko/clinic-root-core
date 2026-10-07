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
import { Sequelize } from 'sequelize-typescript';
import { AppointmentRequestModel } from '../appointment-requests/appointment-request.model.js';
import { PromotionModel } from '../promotions/promotion.model.js';
import { Op } from 'sequelize';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceModel)
    private readonly serviceModel: typeof ServiceModel,

    @InjectModel(ServiceDirectionModel)
    private readonly serviceDirectionModel: typeof ServiceDirectionModel,

    @InjectModel(AppointmentRequestModel)
    private readonly appointmentRequestModel: typeof AppointmentRequestModel,

    @InjectModel(PromotionModel)
    private readonly promotionModel: typeof PromotionModel,

    private readonly sequelize: Sequelize,
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
    const services = await this.serviceModel.findAll({
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

    await this.attachCurrentPromotions(services);

    return services;
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

  async remove(id: string) {
    const service = await this.serviceModel.findByPk(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const requestsCount = await this.appointmentRequestModel.count({
      where: { serviceId: id },
    });

    if (requestsCount) {
      throw new ConflictException(
        'Cannot delete a service referenced by appointment requests',
      );
    }

    await service.destroy();
    return { success: true };
  }

  async findById({
    id,
    onlyActive = false,
  }: {
    id: string;
    onlyActive?: boolean;
  }) {
    const service = await this.serviceModel.findOne({
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

    await this.attachCurrentPromotions([service]);

    return service;
  }

  private currentPromotionWhere() {
    const now = new Date();

    return {
      isActive: true,
      [Op.and]: [
        {
          [Op.or]: [
            { validFrom: null },
            { validFrom: { [Op.lte]: now } },
          ],
        },
        {
          [Op.or]: [
            { validTo: null },
            { validTo: { [Op.gte]: now } },
          ],
        },
      ],
    };
  }

  private async attachCurrentPromotions(services: ServiceModel[]) {
    if (services.length === 0) {
      return;
    }

    const promotions = await this.promotionModel.findAll({
      where: {
        serviceId: {
          [Op.in]: services.map((service) => service.id),
        },
        ...this.currentPromotionWhere(),
      },
      order: [['sortOrder', 'ASC']],
    });

    const promotionByServiceId = new Map(
      promotions.map((promotion) => [promotion.serviceId, promotion]),
    );

    for (const service of services) {
      service.setDataValue(
        'promotion',
        promotionByServiceId.get(service.id) ?? null,
      );
    }
  }

  async reorderServices(serviceIds: string[]) {
    return this.sequelize.transaction(async (transaction) => {
      const services = await this.serviceModel.findAll({
        where: {
          id: serviceIds,
        },

        transaction,
      });

      if (services.length !== serviceIds.length) {
        throw new NotFoundException('One or more services not found');
      }

      const servicesById = new Map(services.map((service) => [service.id, service]));

      for (const [index, serviceId] of serviceIds.entries()) {
        const service = servicesById.get(serviceId);

        if (!service) {
          throw new NotFoundException(`Service ${serviceId} not found`);
        }

        service.sortOrder = index;

        await service.save({
          transaction,
        });
      }

      return {
        success: true,
      };
    });
  }
}