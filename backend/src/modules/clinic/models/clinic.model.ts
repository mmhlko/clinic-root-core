import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

export interface ClinicCreationAttributes {
  id?: string;
  name: string;
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