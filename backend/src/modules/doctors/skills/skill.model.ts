import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

export interface SkillCreationAttributes {
  id?: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'skills',
  indexes: [
    {
      unique: true,
      fields: ['name'],
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