import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ClinicModel } from './clinic.model.js';

export interface ClinicFeatureCreationAttributes {
  id?: string;
  clinicId?: string | null;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'clinic_features',
})
export class ClinicFeatureModel extends Model<
  ClinicFeatureModel,
  ClinicFeatureCreationAttributes
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
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare imageUrl: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare icon: string | null;

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
