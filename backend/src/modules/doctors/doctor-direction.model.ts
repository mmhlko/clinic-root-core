import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ServiceDirectionModel } from '../services/directions/service-direction.model.js';

export interface DoctorDirectionCreationAttributes {
  id?: string;
  doctorId: string;
  directionId: string;
  sortOrder?: number;
}

@Table({
  tableName: 'doctor_directions',
  indexes: [
    {
      unique: true,
      fields: ['doctorId', 'directionId'],
    },
  ],
})
export class DoctorDirectionModel extends Model<
  DoctorDirectionModel,
  DoctorDirectionCreationAttributes
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

  @ForeignKey(() => ServiceDirectionModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare directionId: string;

  @BelongsTo(() => ServiceDirectionModel)
  declare direction: ServiceDirectionModel;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare sortOrder: number;
}