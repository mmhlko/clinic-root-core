import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import type { Transaction } from 'sequelize';

import { DoctorModel } from './doctor.model.js';
import { DoctorEducationModel } from './doctor-education.model.js';
import { DoctorDirectionModel } from './doctor-direction.model.js';
import { DoctorSkillModel } from './skills/doctor-skill.model.js';

import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';

import { ServiceDirectionModel } from '../services/directions/service-direction.model.js';
import { SkillModel } from './skills/skill.model.js';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(DoctorModel)
    private readonly doctorModel: typeof DoctorModel,

    @InjectModel(DoctorEducationModel)
    private readonly doctorEducationModel:
      typeof DoctorEducationModel,

    @InjectModel(DoctorDirectionModel)
    private readonly doctorDirectionModel:
      typeof DoctorDirectionModel,

    @InjectModel(DoctorSkillModel)
    private readonly doctorSkillModel:
      typeof DoctorSkillModel,

    @InjectModel(ServiceDirectionModel)
    private readonly serviceDirectionModel:
      typeof ServiceDirectionModel,

    @InjectModel(SkillModel)
    private readonly skillModel:
      typeof SkillModel,

    private readonly sequelize: Sequelize,
  ) { }

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

      // Создаём образование
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

      // Создаём направления
      if (dto.directionIds && dto.directionIds.length > 0) {
        const directions =
          await this.serviceDirectionModel.findAll({
            where: {
              id: dto.directionIds,
              isActive: true,
            },
            transaction,
          });

        if (directions.length !== dto.directionIds.length) {
          throw new NotFoundException(
            'One or more service directions not found',
          );
        }

        await this.doctorDirectionModel.bulkCreate(
          dto.directionIds.map((directionId, index) => ({
            doctorId: doctor.id,
            directionId,
            sortOrder: index,
          })),
          { transaction },
        );
      }

      // Создаём навыки
      if (dto.skillIds && dto.skillIds.length > 0) {
        const skills = await this.skillModel.findAll({
          where: {
            id: dto.skillIds,
            isActive: true,
          },
          transaction,
        });

        if (skills.length !== dto.skillIds.length) {
          throw new NotFoundException(
            'One or more skills not found',
          );
        }

        await this.doctorSkillModel.bulkCreate(
          dto.skillIds.map((skillId, index) => ({
            doctorId: doctor.id,
            skillId,
            sortOrder: index,
          })),
          { transaction },
        );
      }

      return this.findById({
        id: doctor.id,
        transaction,
      });
    });
  }

  async findById({
    id,
    onlyActive = false,
    transaction,
  }: {
    id: string;
    onlyActive?: boolean;
    transaction?: Transaction;
  }) {
    const doctor = await this.doctorModel.findOne({
      where: {
        id,
        ...(onlyActive
          ? {
            isActive: true,
          }
          : {}),
      },

      include: [
        {
          model: DoctorEducationModel,
          as: 'educations',
        },

        {
          model: DoctorDirectionModel,
          as: 'directions',
          include: [
            {
              model: ServiceDirectionModel,
              as: 'direction',
              where: onlyActive
                ? {
                  isActive: true,
                }
                : undefined,
              required: onlyActive,
            },
          ],
        },

        {
          model: DoctorSkillModel,
          as: 'skills',
          include: [
            {
              model: SkillModel,
              as: 'skill',
              where: onlyActive
                ? {
                  isActive: true,
                }
                : undefined,
              required: onlyActive,
            },
          ],
        },
      ],

      transaction,
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    doctor.educations?.sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    doctor.directions?.sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    doctor.skills?.sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    return doctor;
  }

  async findAll(onlyActive: boolean = false) {
    return this.doctorModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,

      attributes: [
        'id',
        'firstName',
        'lastName',
        'middleName',
        'specialization',
        'experienceStartYear',
        'photoUrl',
        'isActive',
        'createdAt',
        'updatedAt',
      ],

      order: [['lastName', 'ASC']],
    });
  }

  async update(
    id: string,
    dto: UpdateDoctorDto,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      const doctor = await this.findById(
        {
          id,
          transaction,
        }
      );

      // Основные данные врача
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
        doctor.specialization =
          dto.specialization;
      }

      if (dto.experienceStartYear !== undefined) {
        doctor.experienceStartYear =
          dto.experienceStartYear;
      }

      if (dto.description !== undefined) {
        doctor.description = dto.description;
      }

      if (dto.photoUrl !== undefined) {
        doctor.photoUrl = dto.photoUrl;
      }

      // Синхронизация направлений
      if (dto.directionIds !== undefined) {
        const directions =
          await this.serviceDirectionModel.findAll({
            where: {
              id: dto.directionIds,
              isActive: true,
            },
            transaction,
          });

        if (
          directions.length !==
          dto.directionIds.length
        ) {
          throw new NotFoundException(
            'One or more service directions not found',
          );
        }

        await this.doctorDirectionModel.destroy({
          where: {
            doctorId: doctor.id,
          },
          transaction,
        });

        await this.doctorDirectionModel.bulkCreate(
          dto.directionIds.map(
            (directionId, index) => ({
              doctorId: doctor.id,
              directionId,
              sortOrder: index,
            }),
          ),
          { transaction },
        );
      }

      // Синхронизация навыков
      if (dto.skillIds !== undefined) {
        const skills =
          await this.skillModel.findAll({
            where: {
              id: dto.skillIds,
              isActive: true,
            },
            transaction,
          });

        if (
          skills.length !==
          dto.skillIds.length
        ) {
          throw new NotFoundException(
            'One or more skills not found',
          );
        }

        await this.doctorSkillModel.destroy({
          where: {
            doctorId: doctor.id,
          },
          transaction,
        });

        await this.doctorSkillModel.bulkCreate(
          dto.skillIds.map(
            (skillId, index) => ({
              doctorId: doctor.id,
              skillId,
              sortOrder: index,
            }),
          ),
          { transaction },
        );
      }

      await doctor.save({ transaction });

      // Синхронизация образования
      if (dto.educations !== undefined) {
        const existingEducations =
          doctor.educations ?? [];

        const incomingIds = dto.educations
          .filter(
            (education) => education.id,
          )
          .map(
            (education) => education.id,
          );

        // Удаляем старые записи,
        // которых больше нет в запросе
        for (const education of existingEducations) {
          if (
            !incomingIds.includes(
              education.id,
            )
          ) {
            await education.destroy({
              transaction,
            });
          }
        }

        // Обновляем существующие
        // и создаём новые
        for (const educationDto of dto.educations) {
          if (educationDto.id) {
            const education =
              existingEducations.find(
                (item) =>
                  item.id ===
                  educationDto.id,
              );

            if (!education) {
              throw new NotFoundException(
                `Education ${educationDto.id} not found`,
              );
            }

            education.type =
              educationDto.type;

            education.title =
              educationDto.title;

            education.institution =
              educationDto.institution ??
              null;

            education.year =
              educationDto.year ?? null;

            education.description =
              educationDto.description ??
              null;

            education.sortOrder =
              educationDto.sortOrder ?? 0;

            await education.save({
              transaction,
            });
          } else {
            await this.doctorEducationModel.create(
              {
                doctorId: doctor.id,
                type: educationDto.type,
                title: educationDto.title,
                institution:
                  educationDto.institution ??
                  null,
                year:
                  educationDto.year ?? null,
                description:
                  educationDto.description ??
                  null,
                sortOrder:
                  educationDto.sortOrder ?? 0,
              },
              { transaction },
            );
          }
        }
      }

      return this.findById(
        {
          id: doctor.id,
          transaction,
        }
      );
    });
  }

  async setActive(
    id: string,
    isActive: boolean,
  ) {
    const doctor =
      await this.doctorModel.findByPk(id);

    if (!doctor) {
      throw new NotFoundException(
        'Doctor not found',
      );
    }

    doctor.isActive = isActive;

    await doctor.save();

    return this.findById({
      id: doctor.id,
    });
  }
}