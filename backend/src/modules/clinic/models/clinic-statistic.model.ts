import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ClinicModel } from './clinic.model.js';

export interface ClinicStatisticCreationAttributes {
  id?: string;
  clinicId?: string | null;
  value: string;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'clinic_statistics',
})
export class ClinicStatisticModel extends Model<
  ClinicStatisticModel,
  ClinicStatisticCreationAttributes
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
    type: DataType.STRING,
    allowNull: false,
  })
  declare value: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare label: string;

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
