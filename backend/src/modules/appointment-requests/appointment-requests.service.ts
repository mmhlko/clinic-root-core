import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { AppointmentRequestModel } from './appointment-request.model.js';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto.js';
import { UpdateAppointmentRequestDto } from './dto/update-appointment-request.dto.js';
import { AppointmentRequestStatus } from './appointment-request-status.enum.js';
import { ServiceModel } from '../services/service.model.js';
import { DoctorModel } from '../doctors/doctor.model.js';
import { normalizeRussianPhone } from '../../shared/utils/phone.util.js';

@Injectable()
export class AppointmentRequestsService {
  constructor(
    @InjectModel(AppointmentRequestModel)
    private readonly appointmentRequestModel: typeof AppointmentRequestModel,
  ) { }

  async create(dto: CreateAppointmentRequestDto) {
    const phone = normalizeRussianPhone(dto.phone);
    return this.appointmentRequestModel.create({
      name: dto.name,
      phone,
      serviceId: dto.serviceId ?? null,
      doctorId: dto.doctorId ?? null,
      comment: dto.comment ?? null,
    });
  }

  async findAll() {
    return this.appointmentRequestModel.findAll({
      include: [
        {
          model: ServiceModel,
        },
        {
          model: DoctorModel,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: string) {
    const request =
      await this.appointmentRequestModel.findByPk(id, {
        include: [
          {
            model: ServiceModel,
          },
          {
            model: DoctorModel,
          },
        ],
      });

    if (!request) {
      throw new NotFoundException(
        'Appointment request not found',
      );
    }

    return request;
  }

  async update(
    id: string,
    dto: UpdateAppointmentRequestDto,
  ) {
    const request =
      await this.appointmentRequestModel.findByPk(id);

    if (!request) {
      throw new NotFoundException(
        'Appointment request not found',
      );
    }

    await request.update({
      ...(dto.name !== undefined && {
        name: dto.name,
      }),

      ...(dto.phone !== undefined && {
        phone: normalizeRussianPhone(dto.phone),
      }),

      ...(dto.serviceId !== undefined && {
        serviceId: dto.serviceId,
      }),

      ...(dto.doctorId !== undefined && {
        doctorId: dto.doctorId,
      }),

      ...(dto.comment !== undefined && {
        comment: dto.comment,
      }),
    });

    return request;
  }

  async remove(id: string) {
    const request =
      await this.appointmentRequestModel.findByPk(id);

    if (!request) {
      throw new NotFoundException(
        'Appointment request not found',
      );
    }

    await request.destroy();

    return {
      message: 'Appointment request deleted',
    };
  }

  async setStatus(
    id: string,
    status: AppointmentRequestStatus,
  ) {
    const request =
      await this.appointmentRequestModel.findByPk(id);

    if (!request) {
      throw new NotFoundException(
        'Appointment request not found',
      );
    }

    await request.update({
      status,
    });

    return request;
  }
}