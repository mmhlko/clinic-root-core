import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ServiceDirectionModel } from '../services/directions/service-direction.model.js';
import { ClinicModel } from '../clinic/models/clinic.model.js';

export interface DoctorDirectionCreationAttributes {
  id?: string;
  clinicId?: string | null;
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

  @ForeignKey(() => ClinicModel)
  @Column({ type: DataType.UUID, allowNull: true })
  declare clinicId: string | null;

  @BelongsTo(() => ClinicModel)
  declare clinic: ClinicModel | null;

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
