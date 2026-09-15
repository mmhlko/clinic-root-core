import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../../modules/users/users.service.js';
import { UserRole } from '../../modules/users/user-role.enum.js';

@Injectable()
export class RootAdminBootstrap implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createRootAdmin();
  }

  private async createRootAdmin() {
    const email = this.configService.get<string>('ROOT_ADMIN_EMAIL');
    const password = this.configService.get<string>('ROOT_ADMIN_PASSWORD');
    const firstName =
      this.configService.get<string>('ROOT_ADMIN_FIRST_NAME') ?? 'Root';
    const lastName =
      this.configService.get<string>('ROOT_ADMIN_LAST_NAME') ?? 'Admin';

    if (!email || !password) {
      throw new Error(
        'ROOT_ADMIN_EMAIL and ROOT_ADMIN_PASSWORD must be configured',
      );
    }

    const existingRoot = await this.usersService.findByEmail(email);

    if (existingRoot) {
      console.log(`Root admin is already exists: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await this.usersService.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: UserRole.ROOT,
    });

    console.log(`Root admin created: ${email}`);
  }
}