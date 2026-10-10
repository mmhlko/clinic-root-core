import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { DoctorDirectionModel } from '../../doctors/doctor-direction.model.js';
import { ClinicModel } from '../../clinic/models/clinic.model.js';

export interface ServiceDirectionCreationAttributes {
  id?: string;
  clinicId?: string | null;
  name: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'service_directions',
  indexes: [{ name: 'service_directions_clinicId_name_unique', unique: true, fields: ['clinicId', 'name'] }],
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

  @ForeignKey(() => ClinicModel)
  @Column({ type: DataType.UUID, allowNull: true })
  declare clinicId: string | null;

  @BelongsTo(() => ClinicModel)
  declare clinic: ClinicModel | null;
}
