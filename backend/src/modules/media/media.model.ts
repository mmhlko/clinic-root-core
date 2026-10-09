import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ClinicModel } from '../clinic/models/clinic.model.js';

export enum MediaStatus {
  TEMPORARY = 'temporary',
  ATTACHED = 'attached',
}

export interface MediaCreationAttributes {
  id?: string;
  clinicId?: string | null;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  status?: MediaStatus;
}

@Table({
  tableName: 'media',
})
export class MediaModel extends Model<
  MediaModel,
  MediaCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => ClinicModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: { model: 'clinic', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  declare clinicId: string | null;

  @BelongsTo(() => ClinicModel)
  declare clinic: ClinicModel | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare filename: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare url: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare mimeType: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare size: number;

  @Column({
    type: DataType.ENUM(...Object.values(MediaStatus)),
    allowNull: false,
    defaultValue: MediaStatus.TEMPORARY,
  })
  declare status: MediaStatus;
}
