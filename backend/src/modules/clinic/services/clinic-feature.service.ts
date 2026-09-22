import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { ClinicFeatureModel } from '../models/clinic-feature.model.js';
import { SaveClinicFeaturesDto } from '../dto/save-clinic-features.dto.js';
import { Transaction } from 'sequelize/lib/transaction';

@Injectable()
export class ClinicFeatureService {
  constructor(
    @InjectModel(ClinicFeatureModel)
    private readonly clinicFeatureModel:
      typeof ClinicFeatureModel,

    private readonly sequelize: Sequelize,
  ) { }

  async findAll(
    onlyActive = false,
    transaction?: Transaction,
  ) {
    return this.clinicFeatureModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,

      order: [
        ['sortOrder', 'ASC'],
      ],

      transaction,
    });
  }

  async saveAll(
    dto: SaveClinicFeaturesDto,
  ) {
    return this.sequelize.transaction(
      async (transaction) => {
        const existingFeatures =
          await this.clinicFeatureModel.findAll({
            transaction,
          });

        const incomingIds =
          dto.features
            .filter((feature) => feature.id)
            .map((feature) => feature.id!);

        // Удаляем записи,
        // которых больше нет в списке
        for (const feature of existingFeatures) {
          if (
            !incomingIds.includes(
              feature.id,
            )
          ) {
            await feature.destroy({
              transaction,
            });
          }
        }

        // Обновляем существующие
        // и создаём новые
        for (const featureDto of dto.features) {
          if (featureDto.id) {
            const feature =
              existingFeatures.find(
                (item) =>
                  item.id ===
                  featureDto.id,
              );

            if (!feature) {
              throw new NotFoundException(
                `Clinic feature ${featureDto.id} not found`,
              );
            }

            feature.title =
              featureDto.title;

            feature.description =
              featureDto.description ??
              null;

            feature.imageUrl =
              featureDto.imageUrl ?? null;

            feature.icon =
              featureDto.icon ?? null;

            feature.sortOrder =
              featureDto.sortOrder;

            feature.isActive =
              featureDto.isActive ?? true;

            await feature.save({
              transaction,
            });
          } else {
            await this.clinicFeatureModel.create(
              {
                title: featureDto.title,
                description:
                  featureDto.description ??
                  null,
                imageUrl:
                  featureDto.imageUrl ??
                  null,
                icon:
                  featureDto.icon ?? null,
                sortOrder:
                  featureDto.sortOrder,
                isActive:
                  featureDto.isActive ??
                  true,
              },
              { transaction },
            );
          }
        }

        return this.findAll(
          false,
          transaction,
        );
      },
    );
  }
}