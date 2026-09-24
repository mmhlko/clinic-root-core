import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ClinicStatisticModel } from '../models/clinic-statistic.model.js';
import { SaveClinicStatisticsDto } from '../dto/save-clinic-statistics.dto.js';
import { Transaction } from 'sequelize/lib/transaction';



@Injectable()
export class ClinicStatisticService {
  constructor(
    @InjectModel(ClinicStatisticModel)
    private readonly clinicStatisticModel:
      typeof ClinicStatisticModel,

    private readonly sequelize: Sequelize,
  ) {}

  async findAll(
    onlyActive = false,
    transaction?: Transaction,
  ) {
    return this.clinicStatisticModel.findAll({
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
    dto: SaveClinicStatisticsDto,
  ) {
    return this.sequelize.transaction(
      async (transaction) => {
        const existingStatistics =
          await this.clinicStatisticModel.findAll({
            transaction,
          });

        const incomingIds =
          dto.statistics
            .filter((item) => item.id)
            .map((item) => item.id!);

        // Удаляем записи, которых больше нет
        for (
          const statistic of existingStatistics
        ) {
          if (
            !incomingIds.includes(
              statistic.id,
            )
          ) {
            await statistic.destroy({
              transaction,
            });
          }
        }

        // Обновляем существующие и создаём новые
        for (
          const statisticDto of dto.statistics
        ) {
          if (statisticDto.id) {
            const statistic =
              existingStatistics.find(
                (item) =>
                  item.id ===
                  statisticDto.id,
              );

            if (!statistic) {
              throw new NotFoundException(
                `Clinic statistic ${statisticDto.id} not found`,
              );
            }

            statistic.value =
              statisticDto.value;

            statistic.label =
              statisticDto.label;

            statistic.sortOrder =
              statisticDto.sortOrder;

            statistic.isActive =
              statisticDto.isActive ??
              true;

            await statistic.save({
              transaction,
            });
          } else {
            await this.clinicStatisticModel.create(
              {
                value:
                  statisticDto.value,
                label:
                  statisticDto.label,
                sortOrder:
                  statisticDto.sortOrder,
                isActive:
                  statisticDto.isActive ??
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