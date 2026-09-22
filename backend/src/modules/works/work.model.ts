import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { ServiceModel } from '../services/service.model.js';

export interface WorkCreationAttributes {
  id?: string;

  title: string;
  description?: string | null;

  beforeImageUrl: string;
  afterImageUrl: string;

  serviceId?: string | null;

  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'works',
})
export class WorkModel extends Model<
  WorkModel,
  WorkCreationAttributes
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
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare beforeImageUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare afterImageUrl: string;

  @ForeignKey(() => ServiceModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'services',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  declare serviceId: string | null;

  @BelongsTo(() => ServiceModel)
  declare service: ServiceModel;

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