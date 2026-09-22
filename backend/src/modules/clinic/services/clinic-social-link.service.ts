import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';


import { CreateClinicSocialLinkDto } from '../dto/create-clinic-social-link.dto.js';
import { UpdateClinicSocialLinkDto } from '../dto/update-clinic-social-link.dto.js';
import { Sequelize } from 'sequelize-typescript/dist/sequelize/sequelize/sequelize.js';
import { SaveClinicSocialLinksDto } from '../dto/save-clinic-social-links.dto.js';
import { ClinicSocialLinkModel } from '../models/clinic-social-link.model.js';
import { Transaction } from 'sequelize/lib/transaction';

@Injectable()
export class ClinicSocialLinkService {
  constructor(
    @InjectModel(ClinicSocialLinkModel)
    private readonly clinicSocialLinkModel:
      typeof ClinicSocialLinkModel,
    private readonly sequelize: Sequelize,
  ) { }

  async create(
    dto: CreateClinicSocialLinkDto,
  ) {
    const existing =
      await this.clinicSocialLinkModel.findOne({
        where: {
          platform: dto.platform,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Social link for this platform already exists',
      );
    }

    return this.clinicSocialLinkModel.create({
      platform: dto.platform,
      url: dto.url,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(
    onlyActive = false,
    transaction?: Transaction,
  ) {
    return this.clinicSocialLinkModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,

      order: [
        ['sortOrder', 'ASC'],
      ],

      transaction,
    });
  }

  async findById(id: string) {
    const socialLink =
      await this.clinicSocialLinkModel.findByPk(id);

    if (!socialLink) {
      throw new NotFoundException(
        'Social link not found',
      );
    }

    return socialLink;
  }

  async update(
    id: string,
    dto: UpdateClinicSocialLinkDto,
  ) {
    const socialLink =
      await this.findById(id);

    const nextPlatform =
      dto.platform ?? socialLink.platform;

    if (
      dto.platform !== undefined &&
      dto.platform !== socialLink.platform
    ) {
      const existing =
        await this.clinicSocialLinkModel.findOne({
          where: {
            platform: nextPlatform,
          },
        });

      if (
        existing &&
        existing.id !== socialLink.id
      ) {
        throw new ConflictException(
          'Social link for this platform already exists',
        );
      }

      socialLink.platform =
        nextPlatform;
    }

    if (dto.url !== undefined) {
      socialLink.url = dto.url;
    }

    if (dto.sortOrder !== undefined) {
      socialLink.sortOrder =
        dto.sortOrder;
    }

    await socialLink.save();

    return socialLink;
  }

  async setActive(
    id: string,
    isActive: boolean,
  ) {
    const socialLink =
      await this.findById(id);

    socialLink.isActive = isActive;

    await socialLink.save();

    return socialLink;
  }

  async remove(id: string) {
    const socialLink =
      await this.findById(id);

    await socialLink.destroy();

    return {
      message: 'Social link deleted',
    };
  }

  async saveAll(
    dto: SaveClinicSocialLinksDto,
  ) {
    return this.sequelize.transaction(
      async (transaction) => {
        const existingLinks =
          await this.clinicSocialLinkModel.findAll({
            transaction,
          });

        const incomingIds =
          dto.socialLinks
            .filter((link) => link.id)
            .map((link) => link.id!);

        // Удаляем ссылки,
        // которых больше нет в форме
        for (const link of existingLinks) {
          if (!incomingIds.includes(link.id)) {
            await link.destroy({
              transaction,
            });
          }
        }

        // Проверяем, что платформы не дублируются
        const platforms =
          dto.socialLinks.map(
            (link) => link.platform,
          );

        if (
          new Set(platforms).size !==
          platforms.length
        ) {
          throw new ConflictException(
            'Each social platform can only be added once',
          );
        }

        // Обновляем существующие
        // и создаём новые
        for (const linkDto of dto.socialLinks) {
          if (linkDto.id) {
            const link =
              existingLinks.find(
                (item) =>
                  item.id === linkDto.id,
              );

            if (!link) {
              throw new NotFoundException(
                `Social link ${linkDto.id} not found`,
              );
            }

            link.platform =
              linkDto.platform;

            link.url = linkDto.url;

            link.sortOrder =
              linkDto.sortOrder ?? 0;

            link.isActive =
              linkDto.isActive ?? true;

            await link.save({
              transaction,
            });
          } else {
            await this.clinicSocialLinkModel.create(
              {
                platform:
                  linkDto.platform,
                url: linkDto.url,
                sortOrder:
                  linkDto.sortOrder ?? 0,
                isActive:
                  linkDto.isActive ?? true,
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