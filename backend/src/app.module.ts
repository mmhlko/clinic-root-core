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
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { ClinicLocationModule } from './modules/clinic/clinic-location.module.js';
import { ClinicModule } from './modules/clinic/clinic.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { PromotionsModule } from './modules/promotions/promotions.module.js';
import { WorksModule } from './modules/works/works.module.js';
import { FaqModule } from './modules/faq/faq.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { AppointmentRequestsModule } from './modules/appointment-requests/appointment-requests.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

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
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 600000,
          limit: 3,
        },
      ],
    }),
    UsersModule,
    AuthModule,
    BootstrapModule,
    DoctorsModule,
    ServiceDirectionModule,
    ServicesModule,
    SkillsModule,
    ReviewsModule,
    ClinicLocationModule,
    ClinicModule,
    MediaModule,
    PromotionsModule,
    WorksModule,
    FaqModule,
    DocumentsModule,
    AppointmentRequestsModule,
    DashboardModule,
  ],
})
export class AppModule { }