import { Module } from '@nestjs/common';

import { UsersModule } from '../../modules/users/users.module.js';
import { RootAdminBootstrap } from './root-admin.bootstrap.js';

@Module({
  imports: [UsersModule],
  providers: [RootAdminBootstrap],
})
export class BootstrapModule {}