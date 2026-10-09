import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ClinicModel } from '../../clinic/models/clinic.model.js';

export interface SkillCreationAttributes {
  id?: string;
  clinicId?: string | null;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'skills',
  indexes: [
    {
      name: 'skills_clinicId_name_unique',
      unique: true,
      fields: ['clinicId', 'name'],
    },
  ],
})
export class SkillModel extends Model<
  SkillModel,
  SkillCreationAttributes
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
  declare name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare sortOrder: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;
}
