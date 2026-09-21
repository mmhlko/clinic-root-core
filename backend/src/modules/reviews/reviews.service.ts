import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { ReviewModel } from './review.model.js';
import { ReviewStatus } from './review-status.enum.js';
import { DoctorModel } from '../doctors/doctor.model.js';

import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(ReviewModel)
    private readonly reviewModel: typeof ReviewModel,

    @InjectModel(DoctorModel)
    private readonly doctorModel: typeof DoctorModel,
  ) { }

  async create(dto: CreateReviewDto) {
    // Если указан врач —
    // проверяем, что он существует и активен
    if (dto.doctorId) {
      const doctor =
        await this.doctorModel.findOne({
          where: {
            id: dto.doctorId,
            isActive: true,
          },
        });

      if (!doctor) {
        throw new NotFoundException(
          'Doctor not found',
        );
      }
    }

    // Новый отзыв всегда отправляется
    // на модерацию
    return this.reviewModel.create({
      authorName: dto.authorName,
      text: dto.text,
      rating: dto.rating,
      reviewDate: dto.reviewDate
        ? new Date(dto.reviewDate)
        : null,
      doctorId: dto.doctorId ?? null,
      status: ReviewStatus.PENDING,
      isActive: false,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(onlyActive = false) {
    return this.reviewModel.findAll({
      where: onlyActive
        ? {
          status: ReviewStatus.PUBLISHED,
          isActive: true,
        }
        : undefined,

      include: [
        {
          model: DoctorModel,
          as: 'doctor',
          attributes: [
            'id',
            'firstName',
            'lastName',
            'middleName',
            'specialization',
            'photoUrl',
            'isActive',
          ],
          required: false,
        },
      ],

      order: [
        ['sortOrder', 'ASC'],
        ['reviewDate', 'DESC'],
      ],
    });
  }

  async findPending() {
    return this.reviewModel.findAll({
      where: {
        status: ReviewStatus.PENDING,
      },

      include: [
        {
          model: DoctorModel,
          as: 'doctor',
          attributes: [
            'id',
            'firstName',
            'lastName',
            'middleName',
            'specialization',
            'photoUrl',
            'isActive',
          ],
          required: false,
        },
      ],

      order: [
        ['reviewDate', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
  }

  async findById({
    id,
    onlyActive = false,
  }: {
    id: string;
    onlyActive?: boolean;
  }) {
    const review =
      await this.reviewModel.findOne({
        where: {
          id,
          ...(onlyActive
            ? {
              status:
                ReviewStatus.PUBLISHED,
              isActive: true,
            }
            : {}),
        },

        include: [
          {
            model: DoctorModel,
            as: 'doctor',
            attributes: [
              'id',
              'firstName',
              'lastName',
              'middleName',
              'specialization',
              'photoUrl',
              'isActive',
            ],
            required: false,
          },
        ],
      });

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    return review;
  }

  async update(
    id: string,
    dto: UpdateReviewDto,
  ) {
    const review =
      await this.reviewModel.findByPk(id);

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    if (dto.doctorId !== undefined) {
      if (dto.doctorId === null) {
        review.doctorId = null;
      } else {
        const doctor =
          await this.doctorModel.findOne({
            where: {
              id: dto.doctorId,
              isActive: true,
            },
          });

        if (!doctor) {
          throw new NotFoundException(
            'Doctor not found',
          );
        }

        review.doctorId = dto.doctorId;
      }
    }

    if (dto.authorName !== undefined) {
      review.authorName =
        dto.authorName;
    }

    if (dto.text !== undefined) {
      review.text = dto.text;
    }

    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }

    if (dto.reviewDate !== undefined) {
      review.reviewDate =
        dto.reviewDate
          ? new Date(dto.reviewDate)
          : null;
    }

    if (dto.sortOrder !== undefined) {
      review.sortOrder =
        dto.sortOrder;
    }

    await review.save();

    return this.findById({
      id: review.id,
    });
  }

  async publish(id: string) {
    const review =
      await this.reviewModel.findByPk(id);

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    review.status =
      ReviewStatus.PUBLISHED;

    review.isActive = true;

    await review.save();

    return this.findById({
      id: review.id,
    });
  }

  async reject(id: string) {
    const review =
      await this.reviewModel.findByPk(id);

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    review.status =
      ReviewStatus.REJECTED;

    review.isActive = false;

    await review.save();

    return this.findById({
      id: review.id,
    });
  }

  async setActive(
    id: string,
    isActive: boolean,
  ) {
    const review =
      await this.reviewModel.findByPk(id);

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    // Нельзя сделать отклонённый или ожидающий
    // отзыв публично активным напрямую
    if (
      isActive &&
      review.status !==
      ReviewStatus.PUBLISHED
    ) {
      throw new BadRequestException(
        'Only published reviews can be activated',
      );
    }

    review.isActive = isActive;

    await review.save();

    return this.findById({
      id: review.id,
    });
  }

  async remove(id: string) {
    const review =
      await this.reviewModel.findByPk(id);

    if (!review) {
      throw new NotFoundException(
        'Review not found',
      );
    }

    await review.destroy();

    return {
      message: 'Review deleted',
    };
  }
}