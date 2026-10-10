import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { DoctorEducationModel } from './doctor-education.model.js';
import { DoctorDirectionModel } from './doctor-direction.model.js';
import { DoctorSkillModel } from './skills/doctor-skill.model.js';
import { MediaModel } from '../media/media.model.js';
import { ClinicModel } from '../clinic/models/clinic.model.js';

export interface DoctorCreationAttributes {
  id?: string;
  clinicId?: string | null;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  specialization: string;
  experienceStartYear?: number | null;
  description?: string | null;
  photoMediaId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
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

  @ForeignKey(() => ClinicModel)
  @Column({ type: DataType.UUID, allowNull: true })
  declare clinicId: string | null;

  @BelongsTo(() => ClinicModel)
  declare clinic: ClinicModel | null;

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
    allowNull: true,
  })
  declare experienceStartYear: number | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @ForeignKey(() => MediaModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'media',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  declare photoMediaId: string | null;

  @BelongsTo(() => MediaModel)
  declare photoMedia: MediaModel | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare sortOrder: number;

  @HasMany(() => DoctorEducationModel)
  declare educations: DoctorEducationModel[];

  @HasMany(() => DoctorDirectionModel, 'doctorId')
  declare directions: DoctorDirectionModel[];

  @HasMany(() => DoctorSkillModel, 'doctorId')
  declare skills: DoctorSkillModel[];
}
