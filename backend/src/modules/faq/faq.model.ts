import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

export interface FaqCreationAttributes {
  id?: string;

  question: string;
  answer: string;

  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'faq',
})
export class FaqModel extends Model<
  FaqModel,
  FaqCreationAttributes
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
  declare question: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare answer: string;

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