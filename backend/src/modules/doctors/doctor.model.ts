import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { DoctorEducationModel } from './doctor-education.model.js';
import { DoctorDirectionModel } from './doctor-direction.model.js';
import { DoctorSkillModel } from './skills/doctor-skill.model.js';

export interface DoctorCreationAttributes {
  id?: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  specialization: string;
  experienceStartYear: number;
  description?: string | null;
  photoUrl?: string | null;
  isActive?: boolean;
}

@Table({
  tableName: 'doctors',
})
export class DoctorModel extends Model<
  DoctorModel,
  DoctorCreationAttributes
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
  declare firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare middleName: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare specialization: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare experienceStartYear: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare photoUrl: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @HasMany(() => DoctorEducationModel)
  declare educations: DoctorEducationModel[];

  @HasMany(() => DoctorDirectionModel, 'doctorId')
  declare directions: DoctorDirectionModel[];

  @HasMany(() => DoctorSkillModel, 'doctorId')
  declare skills: DoctorSkillModel[];
}