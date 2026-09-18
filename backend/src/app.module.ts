import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { BootstrapModule } from './database/bootstrap/bootstrap.module.js';
import { DoctorsModule } from './modules/doctors/doctors.module.js';
import { ServiceDirectionModule } from './modules/services/directions/service-direction.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { SkillsModule } from './modules/doctors/skills/skills.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',

        host: configService.get<string>('POSTGRES_HOST'),

        port: Number(
          configService.get<string>('POSTGRES_PORT'),
        ),

        username: configService.get<string>('POSTGRES_USER'),

        password: configService.get<string>(
          'POSTGRES_PASSWORD',
        ),

        database: configService.get<string>(
          'POSTGRES_DB',
        ),

        autoLoadModels: true,

        synchronize: true,

        logging: false,
      }),
    }),
    UsersModule,
    AuthModule,
    BootstrapModule,
    DoctorsModule,
    ServiceDirectionModule,
    ServicesModule,
    SkillsModule,
  ],
})
export class AppModule { }