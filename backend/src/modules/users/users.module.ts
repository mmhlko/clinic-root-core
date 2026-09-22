import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { UserModel } from './user.model.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClinicLocationModel } from '../clinic/models/clinic-location.model.js';

@Module({
  imports: [SequelizeModule.forFeature([UserModel, ClinicLocationModel])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
