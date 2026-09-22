import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { FaqModel } from './faq.model.js';

import { FaqService } from './faq.service.js';
import { FaqController } from './faq.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      FaqModel,
    ]),
  ],

  controllers: [
    FaqController,
  ],

  providers: [
    FaqService,
  ],

  exports: [
    FaqService,
  ],
})
export class FaqModule {}