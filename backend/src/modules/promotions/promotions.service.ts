import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { PromotionModel } from './promotion.model.js';
import { ServiceModel } from '../services/service.model.js';

import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { UpdatePromotionDto } from './dto/update-promotion.dto.js';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(PromotionModel)
    private readonly promotionModel: typeof PromotionModel,

    @InjectModel(ServiceModel)
    private readonly serviceModel: typeof ServiceModel,
  ) {}

  async create(dto: CreatePromotionDto) {
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

    const existingPromotion =
      await this.promotionModel.findOne({
        where: {
          title: dto.title,
        },
      });

    if (existingPromotion) {
      throw new ConflictException(
        'Promotion with this title already exists',
      );
    }

    return this.promotionModel.create({
      title: dto.title,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      oldPrice: dto.oldPrice ?? null,
      newPrice: dto.newPrice ?? null,
      validFrom: dto.validFrom
        ? new Date(dto.validFrom)
        : null,
      validTo: dto.validTo
        ? new Date(dto.validTo)
        : null,
      serviceId: dto.serviceId ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(onlyActive = false) {
    return this.promotionModel.findAll({
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
    const promotion =
      await this.promotionModel.findOne({
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

    if (!promotion) {
      throw new NotFoundException(
        'Promotion not found',
      );
    }

    return promotion;
  }

  async update(
    id: string,
    dto: UpdatePromotionDto,
  ) {
    const promotion =
      await this.promotionModel.findByPk(id);

    if (!promotion) {
      throw new NotFoundException(
        'Promotion not found',
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

    if (
      dto.title !== undefined &&
      dto.title !== promotion.title
    ) {
      const existingPromotion =
        await this.promotionModel.findOne({
          where: {
            title: dto.title,
          },
        });

      if (
        existingPromotion &&
        existingPromotion.id !== promotion.id
      ) {
        throw new ConflictException(
          'Promotion with this title already exists',
        );
      }
    }

    if (dto.title !== undefined) {
      promotion.title = dto.title;
    }

    if (dto.description !== undefined) {
      promotion.description = dto.description;
    }

    if (dto.imageUrl !== undefined) {
      promotion.imageUrl = dto.imageUrl;
    }

    if (dto.oldPrice !== undefined) {
      promotion.oldPrice = dto.oldPrice;
    }

    if (dto.newPrice !== undefined) {
      promotion.newPrice = dto.newPrice;
    }

    if (dto.validFrom !== undefined) {
      promotion.validFrom = dto.validFrom
        ? new Date(dto.validFrom)
        : null;
    }

    if (dto.validTo !== undefined) {
      promotion.validTo = dto.validTo
        ? new Date(dto.validTo)
        : null;
    }

    if (dto.serviceId !== undefined) {
      promotion.serviceId = dto.serviceId;
    }

    if (dto.sortOrder !== undefined) {
      promotion.sortOrder = dto.sortOrder;
    }

    await promotion.save();

    return promotion;
  }

  async setActive(
    id: string,
    isActive: boolean,
  ) {
    const promotion =
      await this.promotionModel.findByPk(id);

    if (!promotion) {
      throw new NotFoundException(
        'Promotion not found',
      );
    }

    promotion.isActive = isActive;

    await promotion.save();

    return promotion;
  }

  async remove(id: string) {
    const promotion =
      await this.promotionModel.findByPk(id);

    if (!promotion) {
      throw new NotFoundException(
        'Promotion not found',
      );
    }

    await promotion.destroy();

    return {
      message: 'Promotion deleted',
    };
  }
}