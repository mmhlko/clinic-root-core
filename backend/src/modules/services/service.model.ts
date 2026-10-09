import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ServiceDirectionModel } from './directions/service-direction.model.js';
import type { PromotionModel } from '../promotions/promotion.model.js';
import { ClinicModel } from '../clinic/models/clinic.model.js';


export interface ServiceCreationAttributes {
  id?: string;
  clinicId?: string | null;
  directionId: string;
  name: string;
  description?: string | null;
  price?: number | null;
  isPriceFrom?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'services',
})
export class ServiceModel extends Model<
  ServiceModel,
  ServiceCreationAttributes
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

  @ForeignKey(() => ServiceDirectionModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare directionId: string;

  @BelongsTo(() => ServiceDirectionModel)
  declare direction: ServiceDirectionModel;

  declare promotion?: PromotionModel | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare price: number | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isPriceFrom: boolean;

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
