import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { DoctorModel } from './doctor.model.js';
import { DoctorEducationModel } from './doctor-education.model.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import type { Transaction } from 'sequelize';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(DoctorModel)
    private readonly doctorModel: typeof DoctorModel,

    @InjectModel(DoctorEducationModel)
    private readonly doctorEducationModel: typeof DoctorEducationModel,

    private readonly sequelize: Sequelize,
  ) {}

  async create(dto: CreateDoctorDto) {
    return this.sequelize.transaction(async (transaction) => {
      const doctor = await this.doctorModel.create(
        {
          firstName: dto.firstName,
          lastName: dto.lastName,
          middleName: dto.middleName ?? null,
          specialization: dto.specialization,
          experienceStartYear: dto.experienceStartYear,
          description: dto.description ?? null,
          photoUrl: dto.photoUrl ?? null,
        },
        { transaction },
      );

      if (dto.educations && dto.educations.length > 0) {
        await this.doctorEducationModel.bulkCreate(
          dto.educations.map((education) => ({
            doctorId: doctor.id,
            type: education.type,
            title: education.title,
            institution: education.institution ?? null,
            year: education.year ?? null,
            description: education.description ?? null,
            sortOrder: education.sortOrder ?? 0,
          })),
          { transaction },
        );
      }

      return this.findById(doctor.id, transaction);
    });
  }

  async findById(id: string, transaction?: Transaction) {
    const doctor = await this.doctorModel.findByPk(id, {
      include: [
        {
          model: DoctorEducationModel,
          as: 'educations',
          order: [['sortOrder', 'ASC']],
        },
      ],
      transaction,
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async findAll(onlyActive: boolean = false) {
    return this.doctorModel.findAll({
      where: onlyActive ? { isActive: true } : undefined,
      include: [
        {
          model: DoctorEducationModel,
          as: 'educations',
          order: [['sortOrder', 'ASC']],
        },
      ],
      order: [
        ['lastName', 'ASC'],
        [{ model: DoctorEducationModel, as: 'educations' }, 'sortOrder', 'ASC'],
      ],
    });
  }

  async update(id: string, dto: UpdateDoctorDto) {
    return this.sequelize.transaction(async (transaction) => {
      const doctor = await this.findById(id, transaction);
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }
      // Обновляем данные врача
      if (dto.firstName !== undefined) {
        doctor.firstName = dto.firstName;
      }

      if (dto.lastName !== undefined) {
        doctor.lastName = dto.lastName;
      }

      if (dto.middleName !== undefined) {
        doctor.middleName = dto.middleName;
      }

      if (dto.specialization !== undefined) {
        doctor.specialization = dto.specialization;
      }

      if (dto.experienceStartYear !== undefined) {
        doctor.experienceStartYear = dto.experienceStartYear;
      }

      if (dto.description !== undefined) {
        doctor.description = dto.description;
      }

      if (dto.photoUrl !== undefined) {
        doctor.photoUrl = dto.photoUrl;
      }

      await doctor.save({ transaction });

      // Если educations переданы — синхронизируем их
      if (dto.educations !== undefined) {
        const existingEducations =
          doctor.educations ?? [];

        const incomingIds = dto.educations
          .filter((education) => education.id)
          .map((education) => education.id);

        // Удаляем образования, которых больше нет
        for (const education of existingEducations) {
          if (!incomingIds.includes(education.id)) {
            await education.destroy({ transaction });
          }
        }

        // Обновляем существующие / создаём новые
        for (const educationDto of dto.educations) {
          if (educationDto.id) {
            const education = existingEducations.find(
              (item) => item.id === educationDto.id,
            );

            if (!education) {
              throw new NotFoundException(
                `Education ${educationDto.id} not found`,
              );
            }

            education.type = educationDto.type;
            education.title = educationDto.title;
            education.institution =
              educationDto.institution ?? null;
            education.year = educationDto.year ?? null;
            education.description =
              educationDto.description ?? null;
            education.sortOrder =
              educationDto.sortOrder ?? 0;

            await education.save({ transaction });
          } else {
            await this.doctorEducationModel.create(
              {
                doctorId: doctor.id,
                type: educationDto.type,
                title: educationDto.title,
                institution:
                  educationDto.institution ?? null,
                year: educationDto.year ?? null,
                description:
                  educationDto.description ?? null,
                sortOrder:
                  educationDto.sortOrder ?? 0,
              },
              { transaction },
            );
          }
        }
      }
      return this.findById(doctor.id, transaction);
    });
  }

  async setActive(id: string, isActive: boolean) {
    const doctor = await this.doctorModel.findByPk(id);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    doctor.isActive = isActive;

    await doctor.save();

    return this.findById(id);
  }
}
