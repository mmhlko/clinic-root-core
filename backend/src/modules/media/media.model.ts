import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

export enum MediaStatus {
  TEMPORARY = 'temporary',
  ATTACHED = 'attached',
}

export interface MediaCreationAttributes {
  id?: string;
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