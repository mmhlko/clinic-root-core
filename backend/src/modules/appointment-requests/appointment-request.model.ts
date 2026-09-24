import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { AppointmentRequestStatus } from './appointment-request-status.enum.js';
import { DoctorModel } from '../doctors/doctor.model.js';
import { ServiceModel } from '../services/service.model.js';

export interface AppointmentRequestCreationAttributes {
  id?: string;
  name: string;
  phone: string;
  serviceId?: string | null;
  doctorId?: string | null;
  comment?: string | null;
  status?: AppointmentRequestStatus;
}

@Table({
  tableName: 'appointment_requests',
})
export class AppointmentRequestModel extends Model<
  AppointmentRequestModel,
  AppointmentRequestCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @ForeignKey(() => ServiceModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare serviceId: string | null;

  @BelongsTo(() => ServiceModel, 'serviceId')
  declare service: ServiceModel | null;

  @ForeignKey(() => DoctorModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare doctorId: string | null;

  @BelongsTo(() => DoctorModel, 'doctorId')
  declare doctor: DoctorModel | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare comment: string | null;

  @Column({
    type: DataType.ENUM(
      ...Object.values(AppointmentRequestStatus),
    ),
    allowNull: false,
    defaultValue: AppointmentRequestStatus.NEW,
  })
  declare status: AppointmentRequestStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;
}