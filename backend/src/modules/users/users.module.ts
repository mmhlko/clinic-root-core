import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { UserModel } from './user.model.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClinicLocationModel } from '../clinic/models/clinic-location.model.js';
import { MediaModule } from '../media/media.module.js';
import { ClinicTenantModule } from '../clinic/tenant/clinic-tenant.module.js';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, ClinicLocationModel]),
    MediaModule,
    ClinicTenantModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
