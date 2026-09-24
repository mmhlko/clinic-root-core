import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { FaqModel } from './faq.model.js';

import { CreateFaqDto } from './dto/create-faq.dto.js';
import { UpdateFaqDto } from './dto/update-faq.dto.js';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(FaqModel)
    private readonly faqModel: typeof FaqModel,
  ) {}

  async create(dto: CreateFaqDto) {
    return this.faqModel.create({
      question: dto.question,
      answer: dto.answer,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(onlyActive = false) {
    return this.faqModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,

      order: [['sortOrder', 'ASC']],
    });
  }

  async findById(id: string) {
    const faq = await this.faqModel.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!faq) {
      throw new NotFoundException(
        'FAQ not found',
      );
    }

    return faq;
  }

  async update(
    id: string,
    dto: UpdateFaqDto,
  ) {
    const faq = await this.faqModel.findByPk(id);

    if (!faq) {
      throw new NotFoundException(
        'FAQ not found',
      );
    }

    if (dto.question !== undefined) {
      faq.question = dto.question;
    }

    if (dto.answer !== undefined) {
      faq.answer = dto.answer;
    }

    if (dto.sortOrder !== undefined) {
      faq.sortOrder = dto.sortOrder;
    }

    await faq.save();

    return faq;
  }

  async setActive(
    id: string,
    isActive: boolean,
  ) {
    const faq = await this.faqModel.findByPk(id);

    if (!faq) {
      throw new NotFoundException(
        'FAQ not found',
      );
    }

    faq.isActive = isActive;

    await faq.save();

    return faq;
  }

  async remove(id: string) {
    const faq = await this.faqModel.findByPk(id);

    if (!faq) {
      throw new NotFoundException(
        'FAQ not found',
      );
    }

    await faq.destroy();

    return {
      message: 'FAQ deleted',
    };
  }
}