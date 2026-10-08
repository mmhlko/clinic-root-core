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
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { MediaService } from '../media/media.service.js';
import { MediaModel } from '../media/media.model.js';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(PromotionModel)
    private readonly promotionModel: typeof PromotionModel,

    @InjectModel(ServiceModel)
    private readonly serviceModel: typeof ServiceModel,

    private readonly sequelize: Sequelize,

    private readonly mediaService: MediaService,
  ) { }

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

    const validFrom = dto.validFrom
      ? new Date(dto.validFrom)
      : null;
    const validTo = dto.validTo
      ? new Date(dto.validTo)
      : null;

    await this.assertNoOverlappingPromotion(
      dto.serviceId ?? null,
      validFrom,
      validTo,
    );

    return this.sequelize.transaction(async (transaction) => {
      if (dto.photoMediaId) {
        await this.mediaService.replaceImage(
          null,
          dto.photoMediaId,
          transaction,
        );
      }

      return this.promotionModel.create({
        title: dto.title,
        description: dto.description ?? null,
        photoMediaId: dto.photoMediaId ?? null,
        oldPrice: dto.oldPrice ?? null,
        newPrice: dto.newPrice ?? null,
        validFrom,
        validTo,
        serviceId: dto.serviceId ?? null,
        sortOrder: dto.sortOrder ?? 0,
      }, { transaction });
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
        {
          model: MediaModel,
          as: 'photoMedia',
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
    const previousMediaId = promotion.photoMediaId;

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

    if (dto.photoMediaId !== undefined) {
      promotion.photoMediaId = dto.photoMediaId;
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

    if (promotion.isActive) {
      await this.assertNoOverlappingPromotion(
        promotion.serviceId,
        promotion.validFrom,
        promotion.validTo,
        promotion.id,
      );
    }

    if (dto.sortOrder !== undefined) {
      promotion.sortOrder = dto.sortOrder;
    }

    let mediaToDelete: MediaModel | null = null;
    await this.sequelize.transaction(async (transaction) => {
      if (dto.photoMediaId !== undefined) {
        mediaToDelete = await this.mediaService.replaceImage(
          previousMediaId,
          dto.photoMediaId,
          transaction,
        );
      }
      await promotion.save({ transaction });
    });
    if (mediaToDelete) await this.mediaService.delete(mediaToDelete);

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

    if (isActive) {
      await this.assertNoOverlappingPromotion(
        promotion.serviceId,
        promotion.validFrom,
        promotion.validTo,
        promotion.id,
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

  async reorderPromotions(promotionIds: string[]) {
    return this.sequelize.transaction(async (transaction) => {
      const promotions = await this.promotionModel.findAll({
        where: {
          id: promotionIds,
        },

        transaction,
      });

      if (promotions.length !== promotionIds.length) {
        throw new NotFoundException('One or more promotions not found');
      }

      const promotionsById = new Map(promotions.map((promotion) => [promotion.id, promotion]));

      for (const [index, promotionId] of promotionIds.entries()) {
        const promotion = promotionsById.get(promotionId);

        if (!promotion) {
          throw new NotFoundException(`Promotion ${promotionId} not found`);
        }

        promotion.sortOrder = index;

        await promotion.save({
          transaction,
        });
      }

      return {
        success: true,
      };
    });
  }

  private async assertNoOverlappingPromotion(
    serviceId: string | null,
    validFrom: Date | null,
    validTo: Date | null,
    excludedPromotionId?: string,
  ) {
    if (!serviceId) {
      return;
    }

    const startsAt = validFrom?.getTime() ?? Date.now();
    const endsAt = validTo?.getTime() ?? Number.POSITIVE_INFINITY;

    if (endsAt < Date.now()) {
      return;
    }

    if (startsAt > endsAt) {
      throw new ConflictException(
        'Promotion end date must be after its start date',
      );
    }

    const existingPromotions =
      await this.promotionModel.findAll({
        where: {
          serviceId,
          isActive: true,
          ...(excludedPromotionId
            ? { id: { [Op.ne]: excludedPromotionId } }
            : {}),
        },
        attributes: ['id', 'validFrom', 'validTo'],
      });

    const overlaps = existingPromotions.some((existing) => {
      const existingStartsAt =
        existing.validFrom?.getTime() ?? Number.NEGATIVE_INFINITY;
      const existingEndsAt =
        existing.validTo?.getTime() ?? Number.POSITIVE_INFINITY;

      return startsAt <= existingEndsAt && existingStartsAt <= endsAt;
    });

    if (overlaps) {
      throw new ConflictException(
        'An active promotion already exists for this service during this period',
      );
    }
  }
}