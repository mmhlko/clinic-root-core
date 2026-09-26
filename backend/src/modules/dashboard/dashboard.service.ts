import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op } from 'sequelize';

import { AppointmentRequestModel } from '../appointment-requests/appointment-request.model.js';
import { AppointmentRequestStatus } from '../appointment-requests/appointment-request-status.enum.js';
import { DoctorModel } from '../doctors/doctor.model.js';
import { ServiceModel } from '../services/service.model.js';
import { ReviewModel } from '../reviews/review.model.js';
import { ReviewStatus } from '../reviews/review-status.enum.js';
import { PromotionModel } from '../promotions/promotion.model.js';
import { DocumentModel } from '../documents/document.model.js';
import { FaqModel } from '../faq/faq.model.js';
import { ServiceDirectionModel } from '../services/directions/service-direction.model.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(AppointmentRequestModel)
    private readonly appointmentRequestModel: typeof AppointmentRequestModel,

    @InjectModel(DoctorModel)
    private readonly doctorModel: typeof DoctorModel,

    @InjectModel(ServiceModel)
    private readonly serviceModel: typeof ServiceModel,

    @InjectModel(ServiceDirectionModel)
    private readonly serviceDirectionModel: typeof ServiceDirectionModel,

    @InjectModel(ReviewModel)
    private readonly reviewModel: typeof ReviewModel,

    @InjectModel(PromotionModel)
    private readonly promotionModel: typeof PromotionModel,

    @InjectModel(DocumentModel)
    private readonly documentModel: typeof DocumentModel,

    @InjectModel(FaqModel)
    private readonly faqModel: typeof FaqModel,
  ) {}

  async getDashboard() {
    const [
      doctors,
      services,
      directions,
      reviews,
      promotions,
      documents,
      faqs,

      totalRequests,
      newRequests,
      inProgressRequests,
      completedRequests,
      cancelledRequests,

      pendingReviews,

      recentRequests,
      requestTrendRows,
    ] = await Promise.all([
      this.doctorModel.count({
        where: {
          isActive: true,
        },
      }),

      this.serviceModel.count({
        where: {
          isActive: true,
        },
      }),

      this.serviceDirectionModel.count({
        where: {
          isActive: true,
        },
      }),

      this.reviewModel.count({
        where: {
          status: ReviewStatus.PUBLISHED,
        },
      }),

      this.promotionModel.count({
        where: {
          isActive: true,
        },
      }),

      this.documentModel.count({
        where: {
          isActive: true,
        },
      }),

      this.faqModel.count({
        where: {
          isActive: true,
        },
      }),

      this.appointmentRequestModel.count(),

      this.appointmentRequestModel.count({
        where: {
          status: AppointmentRequestStatus.NEW,
        },
      }),

      this.appointmentRequestModel.count({
        where: {
          status: AppointmentRequestStatus.IN_PROGRESS,
        },
      }),

      this.appointmentRequestModel.count({
        where: {
          status: AppointmentRequestStatus.COMPLETED,
        },
      }),

      this.appointmentRequestModel.count({
        where: {
          status: AppointmentRequestStatus.CANCELLED,
        },
      }),

      this.reviewModel.count({
        where: {
          status: ReviewStatus.PENDING,
        },
      }),

      this.appointmentRequestModel.findAll({
        limit: 5,
        attributes: [
          'id',
          'name',
          'phone',
          'comment',
          'status',
          'createdAt',
        ],
        include: [
          {
            model: ServiceModel,
            attributes: ['id', 'name'],
          },
          {
            model: DoctorModel,
            attributes: ['id', 'firstName', 'lastName', 'specialization'],
          },
        ],
        order: [['createdAt', 'DESC']],
      }),

      this.appointmentRequestModel.findAll({
        attributes: [
          [fn('DATE', col('createdAt')), 'date'],
          [fn('COUNT', col('id')), 'count'],
        ],
        where: {
          createdAt: {
            [Op.gte]: this.getTrendStartDate(),
          },
        },
        group: [fn('DATE', col('createdAt'))],
        order: [[fn('DATE', col('createdAt')), 'ASC']],
        raw: true,
      }),
    ]);

    const trendStartDate = this.getTrendStartDate();
    const requestCountsByDate = new Map<string, number>();

    for (const row of requestTrendRows as unknown as Array<{
      date: string | Date;
      count: string | number;
    }>) {
      const date = row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10);

      requestCountsByDate.set(date, Number(row.count));
    }

    const requestTrend = Array.from({ length: 90 }, (_, index) => {
      const date = new Date(trendStartDate.getTime() + index * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().slice(0, 10);

      return {
        date: dateKey,
        count: requestCountsByDate.get(dateKey) ?? 0,
      };
    });

    return {
      overview: {
        doctors,
        services,
        directions,
        reviews,
        promotions,
        documents,
        faqs,
      },

      appointmentRequests: {
        total: totalRequests,
        new: newRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        cancelled: cancelledRequests,
      },

      requestTrend,

      moderation: {
        pendingReviews,
      },

      recentRequests,
    };
  }

  private getTrendStartDate() {
    const today = new Date();
    const startDate = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    ));
    startDate.setUTCDate(startDate.getUTCDate() - 89);

    return startDate;
  }
}