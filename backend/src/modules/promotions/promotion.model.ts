import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { ServiceModel } from '../services/service.model.js';

export interface PromotionCreationAttributes {
  id?: string;

  title: string;
  description?: string | null;

  imageUrl?: string | null;

  oldPrice?: number | null;
  newPrice?: number | null;

  validFrom?: Date | null;
  validTo?: Date | null;

  serviceId?: string | null;

  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'promotions',
})
export class PromotionModel extends Model<
  PromotionModel,
  PromotionCreationAttributes
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
    allowNull: true,
  })
  declare imageUrl: string | null;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare oldPrice: number | null;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare newPrice: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare validFrom: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare validTo: Date | null;

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