import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

export interface ClinicStatisticCreationAttributes {
  id?: string;
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