import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { DoctorEducationType } from './types/doctor-education-type.enum.js';
import { DoctorModel } from './doctor.model.js';

export interface DoctorEducationCreationAttributes {
  id?: string;
  doctorId: string;
  type: DoctorEducationType;
  title: string;
  institution?: string | null;
  year?: number | null;
  description?: string | null;
  sortOrder?: number;
}

@Table({
  tableName: 'doctor_educations',
})
export class DoctorEducationModel extends Model<
  DoctorEducationModel,
  DoctorEducationCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => DoctorModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare doctorId: string;

  @BelongsTo(() => DoctorModel)
  declare doctor: DoctorModel;

  @Column({
    type: DataType.ENUM(...Object.values(DoctorEducationType)),
    allowNull: false,
  })
  declare type: DoctorEducationType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare institution: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare year: number | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare sortOrder: number;
}