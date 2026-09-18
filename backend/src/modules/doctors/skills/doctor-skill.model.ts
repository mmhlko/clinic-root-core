import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { SkillModel } from './skill.model.js';


export interface DoctorSkillCreationAttributes {
  id?: string;
  doctorId: string;
  skillId: string;
  sortOrder?: number;
}

@Table({
  tableName: 'doctor_skills',
  indexes: [
    {
      unique: true,
      fields: ['doctorId', 'skillId'],
    },
  ],
})
export class DoctorSkillModel extends Model<
  DoctorSkillModel,
  DoctorSkillCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  declare doctorId: string;

  @ForeignKey(() => SkillModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare skillId: string;

  @BelongsTo(() => SkillModel)
  declare skill: SkillModel;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare sortOrder: number;
}