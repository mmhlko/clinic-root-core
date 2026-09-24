import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { FaqModel } from './faq.model.js';

import { SaveFaqDto } from './dto/save-faq.dto.js';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(FaqModel)
    private readonly faqModel: typeof FaqModel,

    private readonly sequelize: Sequelize,
  ) {}

  async findAll(onlyActive = false) {
    return this.faqModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,

      order: [['sortOrder', 'ASC']],
    });
  }

  async saveAll(dto: SaveFaqDto) {
    return this.sequelize.transaction(async (transaction) => {
      const existingFaqs = await this.faqModel.findAll({
        transaction,
      });

      const incomingIds = dto.faqs
        .filter((faq) => faq.id)
        .map((faq) => faq.id!);

      for (const faq of existingFaqs) {
        if (!incomingIds.includes(faq.id)) {
          await faq.destroy({ transaction });
        }
      }

      for (const faqDto of dto.faqs) {
        if (faqDto.id) {
          const faq = existingFaqs.find(
            (item) => item.id === faqDto.id,
          );

          if (!faq) {
            throw new NotFoundException(
              `FAQ ${faqDto.id} not found`,
            );
          }

          faq.question = faqDto.question;
          faq.answer = faqDto.answer;
          faq.sortOrder = faqDto.sortOrder;
          faq.isActive = faqDto.isActive ?? true;

          await faq.save({ transaction });
        } else {
          await this.faqModel.create(
            {
              question: faqDto.question,
              answer: faqDto.answer,
              sortOrder: faqDto.sortOrder,
              isActive: faqDto.isActive ?? true,
            },
            { transaction },
          );
        }
      }

      return this.faqModel.findAll({
        transaction,
        order: [['sortOrder', 'ASC']],
      });
    });
  }
}