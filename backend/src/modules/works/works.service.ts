import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { WorkModel } from './work.model.js';
import { ServiceModel } from '../services/service.model.js';

import { CreateWorkDto } from './dto/create-work.dto.js';
import { UpdateWorkDto } from './dto/update-work.dto.js';

@Injectable()
export class WorksService {
  constructor(
    @InjectModel(WorkModel)
    private readonly workModel: typeof WorkModel,

    @InjectModel(ServiceModel)
    private readonly serviceModel: typeof ServiceModel,
  ) {}

  async create(dto: CreateWorkDto) {
    if (dto.serviceId) {
      const service = await this.serviceModel.findOne({
        where: {
          id: dto.serviceId,
          isActive: true,
        },
      });

      if (!service) {
        throw new NotFoundException(
          'Active service not found',
        );
      }
    }

    return this.workModel.create({
      title: dto.title,
      description: dto.description ?? null,
      beforeImageUrl: dto.beforeImageUrl,
      afterImageUrl: dto.afterImageUrl,
      serviceId: dto.serviceId ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(onlyActive = false) {
    return this.workModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,

      include: [
        {
          model: ServiceModel,
          as: 'service',
        },
      ],

      order: [['sortOrder', 'ASC']],
    });
  }

  async findById(id: string) {
    const work = await this.workModel.findOne({
      where: {
        id,
        isActive: true,
      },
      include: [
        {
          model: ServiceModel,
          as: 'service',
        },
      ],
    });

    if (!work) {
      throw new NotFoundException(
        'Work not found',
      );
    }

    return work;
  }

  async update(
    id: string,
    dto: UpdateWorkDto,
  ) {
    const work = await this.workModel.findByPk(id);

    if (!work) {
      throw new NotFoundException(
        'Work not found',
      );
    }

    if (
      dto.serviceId !== undefined &&
      dto.serviceId !== null
    ) {
      const service =
        await this.serviceModel.findOne({
          where: {
            id: dto.serviceId,
            isActive: true,
          },
        });

      if (!service) {
        throw new NotFoundException(
          'Active service not found',
        );
      }
    }

    if (dto.title !== undefined) {
      work.title = dto.title;
    }

    if (dto.description !== undefined) {
      work.description = dto.description;
    }

    if (dto.beforeImageUrl !== undefined) {
      work.beforeImageUrl =
        dto.beforeImageUrl;
    }

    if (dto.afterImageUrl !== undefined) {
      work.afterImageUrl =
        dto.afterImageUrl;
    }

    if (dto.serviceId !== undefined) {
      work.serviceId = dto.serviceId;
    }

    if (dto.sortOrder !== undefined) {
      work.sortOrder = dto.sortOrder;
    }

    await work.save();

    return work;
  }

  async setActive(
    id: string,
    isActive: boolean,
  ) {
    const work = await this.workModel.findByPk(id);

    if (!work) {
      throw new NotFoundException(
        'Work not found',
      );
    }

    work.isActive = isActive;

    await work.save();

    return work;
  }

  async remove(id: string) {
    const work = await this.workModel.findByPk(id);

    if (!work) {
      throw new NotFoundException(
        'Work not found',
      );
    }

    await work.destroy();

    return {
      message: 'Work deleted',
    };
  }
}