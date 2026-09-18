import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { DoctorDirectionModel } from '../../doctors/doctor-direction.model.js';

export interface ServiceDirectionCreationAttributes {
  id?: string;
  name: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'service_directions',
})
export class ServiceDirectionModel extends Model<
  ServiceDirectionModel,
  ServiceDirectionCreationAttributes
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
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

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

  @HasMany(() => DoctorDirectionModel)
  declare doctors: DoctorDirectionModel[];
}