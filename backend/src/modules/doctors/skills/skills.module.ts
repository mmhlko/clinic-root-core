import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SkillModel } from './skill.model.js';
import { SkillsService } from './skills.service.js';
import { SkillsController } from './skills.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SkillModel,
    ]),
  ],
  providers: [SkillsService],
  controllers: [SkillsController],
  exports: [SkillsService],
})
export class SkillsModule {}