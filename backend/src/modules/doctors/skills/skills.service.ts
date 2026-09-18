import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { SkillModel } from './skill.model.js';
import { CreateSkillDto } from './dto/create-skill.dto.js';
import { UpdateSkillDto } from './dto/update-skill.dto.js';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(SkillModel)
    private readonly skillModel: typeof SkillModel,
  ) { }

  async create(dto: CreateSkillDto) {
    const existingSkill =
      await this.skillModel.findOne({
        where: {
          name: dto.name,
        },
      });

    if (existingSkill) {
      throw new ConflictException(
        'Skill already exists',
      );
    }

    return this.skillModel.create({
      name: dto.name,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async findAll(onlyActive: boolean = false) {
    return this.skillModel.findAll({
      where: onlyActive
        ? { isActive: true }
        : undefined,
      order: [['sortOrder', 'ASC']],
    });
  }

  async findById(id: string) {
    const skill = await this.skillModel.findByPk(id);

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async update(id: string, dto: UpdateSkillDto) {
    const skill = await this.findById(id);

    if (
      dto.name !== undefined &&
      dto.name !== skill.name
    ) {
      const existingSkill =
        await this.skillModel.findOne({
          where: {
            name: dto.name,
          },
        });

      if (existingSkill) {
        throw new ConflictException(
          'Skill already exists',
        );
      }

      skill.name = dto.name;
    }

    if (dto.sortOrder !== undefined) {
      skill.sortOrder = dto.sortOrder;
    }

    await skill.save();

    return skill;
  }

  async setActive(id: string, isActive: boolean) {
    const skill = await this.findById(id);

    skill.isActive = isActive;

    await skill.save();

    return skill;
  }

  async remove(id: string) {
    const skill = await this.findById(id);

    await skill.destroy();

    return {
      message: 'Skill deleted',
    };
  }
}