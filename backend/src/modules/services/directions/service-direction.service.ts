import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { ServiceDirectionModel } from './service-direction.model.js';
import { CreateServiceDirectionDto } from './dto/create-service-direction.dto.js';

@Injectable()
export class ServiceDirectionService {
  constructor(
    @InjectModel(ServiceDirectionModel)
    private readonly serviceDirectionModel: typeof ServiceDirectionModel,
  ) {}

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
}