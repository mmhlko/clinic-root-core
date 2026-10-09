import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';
import { ClinicStatus } from '../enum/clinic-status.enum.js';

export interface ClinicCreationAttributes {
  id?: string;
  name: string;
  slug: string;
  status?: ClinicStatus;
  isSystemDemo?: boolean;
  shortDescription?: string | null;
  description?: string | null;
  slogan?: string | null;
  phone?: string | null;
  email?: string | null;
  legalName?: string | null;
  licenseNumber?: string | null;
  licenseDate?: Date | null;
  inn?: string | null;
  ogrn?: string | null;
}

@Table({
  tableName: 'clinic',
  indexes: [{ name: 'clinic_slug_unique', unique: true, fields: ['slug'] }],
})
export class ClinicModel extends Model<
  ClinicModel,
  ClinicCreationAttributes
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

  @Column({ type: DataType.STRING(80), allowNull: false })
  declare slug: string;

  @Column({
    type: DataType.ENUM(...Object.values(ClinicStatus)),
    allowNull: false,
    defaultValue: ClinicStatus.DEMO,
  })
  declare status: ClinicStatus;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isSystemDemo: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare shortDescription: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare slogan: string | null;

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
    type: DataType.STRING,
    allowNull: true,
  })
  declare legalName: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare licenseNumber: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare licenseDate: Date | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare inn: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare ogrn: string | null;
}
