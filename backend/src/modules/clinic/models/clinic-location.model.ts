import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

export interface ClinicLocationCreationAttributes {
  id?: string;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  workingHours?: Record<string, string> | null;
  mapUrl?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'clinic_locations',
})
export class ClinicLocationModel extends Model<
  ClinicLocationModel,
  ClinicLocationCreationAttributes
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
    type: DataType.STRING,
    allowNull: false,
  })
  declare address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare email: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare workingHours:
    | Record<string, string>
    | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare mapUrl: string | null;

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
}