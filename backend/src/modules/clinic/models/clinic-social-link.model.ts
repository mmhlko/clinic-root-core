import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ClinicSocialPlatform } from '../enum/clinic-social-platform.enum.js';
import { ClinicModel } from './clinic.model.js';


export interface ClinicSocialLinkCreationAttributes {
  id?: string;
  clinicId?: string | null;
  platform: ClinicSocialPlatform;
  url: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Table({
  tableName: 'clinic_social_links',
  indexes: [
    {
      name: 'clinic_social_links_clinicId_platform_unique',
      unique: true,
      fields: ['clinicId', 'platform'],
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

  @ForeignKey(() => ClinicModel)
  @Column({ type: DataType.UUID, allowNull: true })
  declare clinicId: string | null;

  @BelongsTo(() => ClinicModel)
  declare clinic: ClinicModel | null;

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
