import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';
import { ClinicSocialPlatform } from '../enum/clinic-social-platform.enum.js';


export interface ClinicSocialLinkCreationAttributes {
  id?: string;
  platform: ClinicSocialPlatform;
  url: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'clinic_social_links',
  indexes: [
    {
      unique: true,
      fields: ['platform'],
    },
  ],
})
export class ClinicSocialLinkModel extends Model<
  ClinicSocialLinkModel,
  ClinicSocialLinkCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.ENUM(
      ...Object.values(ClinicSocialPlatform),
    ),
    allowNull: false,
  })
  declare platform: ClinicSocialPlatform;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare url: string;

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